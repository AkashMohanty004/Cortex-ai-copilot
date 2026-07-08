import os
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from typing import List, Optional
import google.generativeai as genai
from database.connection import get_db
from models.database_models import Customer, TelemetryReading, Alert, ChatMessage
from schemas.api_schemas import ChatRequest, ChatResponse, CitedSource, ChatMessageSchema
from rag.rag_pipeline import search_relevant_chunks, configure_gemini

logger = logging.getLogger("cortex.copilot")
router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.get("/history/{customer_id}", response_model=List[ChatMessageSchema])
async def get_chat_history(customer_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch previous chat messages for a specific customer/facility context."""
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.customer_id == customer_id)
        .order_by(ChatMessage.timestamp)
        .limit(100)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/chat", response_model=ChatResponse)
async def post_copilot_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """AI Copilot Chat: RAG-based query answering using real-time sensor telemetry and document database."""
    customer_id = request.customer_id
    user_query = request.message

    # 1. Verify Customer
    customer_stmt = select(Customer).where(Customer.id == customer_id)
    customer_res = await db.execute(customer_stmt)
    customer = customer_res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2. Save User Message
    user_msg = ChatMessage(
        customer_id=customer_id,
        sender="user",
        text=user_query,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(user_msg)
    await db.commit()

    # 3. Retrieve Live Telemetry Data
    telemetry_stmt = (
        select(TelemetryReading)
        .where(TelemetryReading.customer_id == customer_id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(1)
    )
    telemetry_res = await db.execute(telemetry_stmt)
    latest_reading = telemetry_res.scalar_one_or_none()

    # 4. Retrieve Active Alerts
    alerts_stmt = (
        select(Alert)
        .where(Alert.customer_id == customer_id)
        .where(Alert.status == "Active")
    )
    alerts_res = await db.execute(alerts_stmt)
    active_alerts = alerts_res.scalars().all()

    # 5. Retrieve Relevant RAG Document Chunks
    relevant_chunks = await search_relevant_chunks(user_query, db, limit=5)

    # 6. Format Grounded Prompt for Gemini
    live_data_summary = "N/A"
    if latest_reading:
        live_data_summary = (
            f"Voltage: {latest_reading.voltage:.2f}V L-L (Phase A: {latest_reading.voltage_phase1 or 0:.1f}V, "
            f"Phase B: {latest_reading.voltage_phase2 or 0:.1f}V, Phase C: {latest_reading.voltage_phase3 or 0:.1f}V)\n"
            f"Current: {latest_reading.current:.2f}A (Phase A: {latest_reading.current_phase1 or 0:.1f}A, "
            f"Phase B: {latest_reading.current_phase2 or 0:.1f}A, Phase C: {latest_reading.current_phase3 or 0:.1f}A)\n"
            f"Active Power: {latest_reading.power:.2f} kW\n"
            f"Apparent Power: {latest_reading.apparent_power:.2f} kVA\n"
            f"Power Factor: {latest_reading.power_factor:.3f}\n"
            f"Frequency: {latest_reading.frequency:.2f} Hz\n"
            f"Transformer Temperature: {latest_reading.temperature:.1f} °C\n"
            f"Energy Today: {latest_reading.energy_today or 0:.2f} kWh\n"
            f"Health Score: {latest_reading.health_score or 100:.1f}%"
        )

    alerts_summary = "No active alerts."
    if active_alerts:
        alerts_summary = "\n".join(
            [f"- [{a.severity}] Source: {a.source}. Message: {a.message}. Value: {a.value or 'N/A'}" 
             for a in active_alerts]
        )

    document_context = ""
    cited_sources = []
    for i, chunk in enumerate(relevant_chunks):
        # Clean up chunk text formatting
        chunk_clean = chunk.content.replace('\n', ' ')
        document_context += f"Document Chunk [{i+1}] (Source: {chunk.document_name}):\n{chunk.content}\n\n"
        cited_sources.append(CitedSource(
            document_name=chunk.document_name,
            snippet=chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content
        ))

    # Base prompt construction
    prompt = f"""You are the Cortex AI Copilot, a senior industrial energy specialist and operations engineer.
You are helping the staff at the facility: "{customer.name}" located in "{customer.location}".
The staff member's role is: "{customer.role}".

Answer the user's question precisely using the provided Live Sensor Data, Active Alerts, and Document Context.
If the information is not in the context, use your engineering knowledge to help them, but state clearly what is from context and what is general best-practice.

=== LIVE FACILITY METRICS ===
{live_data_summary}

=== ACTIVE ALERTS ===
{alerts_summary}

=== COMPANY GUIDELINES & MANUAL CONTEXT ===
{document_context if document_context else "No documentation chunks matched the query."}

=== USER QUERY ===
{user_query}

=== RESPONSE GUIDELINES ===
1. Use Markdown formatting.
2. Be professional, highly technical, and action-oriented.
3. If troubleshooting an alert, cite specific thresholds from the documents if available.
4. Do NOT say "Based on document chunk 1..." instead state facts and refer to document titles naturally.
5. If you advise plotting or analyzing a trend, recommend checking the Analytics page.
"""

    reply_text = ""
    chart_type = None
    code_block = None

    # 7. Call Gemini Model
    gemini_active = configure_gemini()
    if not gemini_active:
        reply_text = (
            "⚠️ **Gemini API Key Missing**: The Cortex AI Copilot requires a Google Gemini API Key to answer questions. "
            "Please provide a valid `GEMINI_API_KEY` in the environment or backend `.env` file to activate natural language processing. "
            "In the meantime, here is the raw diagnostic context fetched:\n\n"
            f"**Live Telemetry Status:**\n```\n{live_data_summary}\n```\n\n"
            f"**Active Alerts:**\n```\n{alerts_summary}\n```"
        )
    else:
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            reply_text = response.text
            
            # Simple heuristic: see if the model output references standard code block or suggest a chart
            if "```" in reply_text:
                # Extract code block if any
                parts = reply_text.split("```")
                if len(parts) >= 3:
                    code_block = parts[1]
                    
            if "chart" in user_query.lower() or "graph" in user_query.lower() or "plot" in user_query.lower():
                chart_type = "line"
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            reply_text = (
                "⚠️ **Gemini API Error/Expiration**: Could not generate a response from the Gemini model "
                f"({str(e)}). Active system diagnostics fallback has been activated.\n\n"
                f"**Live Telemetry Status:**\n```\n{live_data_summary}\n```\n\n"
                f"**Active Alerts:**\n```\n{alerts_summary}\n```"
            )

    # 8. Save Assistant Response in Chat History
    # We serialize references list as list of dicts
    references_data = [{"document_name": c.document_name, "snippet": c.snippet} for c in cited_sources]
    
    assistant_msg = ChatMessage(
        customer_id=customer_id,
        sender="assistant",
        text=reply_text,
        timestamp=datetime.now(timezone.utc),
        chart_type=chart_type,
        code_block=code_block,
        references_list=references_data
    )
    db.add(assistant_msg)
    await db.commit()

    return ChatResponse(
        reply=reply_text,
        cited_sources=cited_sources,
        chart_type=chart_type,
        code_block=code_block
    )

@router.post("/index")
async def trigger_reindexing(db: AsyncSession = Depends(get_db)):
    """API endpoint to trigger re-indexing of documents in the backend/docs/ folder."""
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")
    if not os.path.exists(docs_dir):
        os.makedirs(docs_dir)
        
    files = [os.path.join(docs_dir, f) for f in os.listdir(docs_dir) 
             if os.path.isfile(os.path.join(docs_dir, f)) and f.lower().endswith(('.pdf', '.docx', '.txt'))]
             
    if not files:
        # Create sample document if empty
        sample_file = os.path.join(docs_dir, "alert_safety_protocols.txt")
        with open(sample_file, "w", encoding="utf-8") as f:
            f.write("CORTEX AI - INDUSTRIAL ENERGY MANAGEMENT SAFETY PROTOCOLS\n...")
        files.append(sample_file)
        
    from rag.rag_pipeline import index_document
    from sqlalchemy import text
    
    # Clear previous chunks
    await db.execute(text("TRUNCATE TABLE document_chunks;"))
    await db.commit()
    
    files_indexed = 0
    for file in files:
        res = await index_document(file, db)
        if res.get("status") == "success":
            files_indexed += 1
            
    return {"status": "success", "files_indexed": files_indexed}

