# Cortex AI Backend API

This is the FastAPI backend service for the Cortex AI Industrial Energy Monitoring Platform. It provides endpoints for customer management, telemetry readings, reports, dashboard summaries, and the RAG-based AI Copilot.

## Core Features
1. **Live Telemetry & Alerts:** Serves data directly from the existing Supabase PostgreSQL instance.
2. **AI Copilot (`POST /api/copilot/chat`):** Grounds a user's question using current telemetry parameters, active warnings/alerts, and relevant document context.
3. **RAG Pipeline (pgvector):** Leverages `pgvector` for similarity matching of embedded document chunks.
4. **Google Gemini integration:** Uses Gemini (`gemini-1.5-flash` and `text-embedding-004`) to run RAG.

## Project Structure
```
backend/
  api/
    routers/
      customers.py     # Customer CRUD & history endpoints
      dashboard.py     # Aggregated stats & chart datasets
      reports.py       # Energy audits
      copilot.py       # Chat bot + history
  database/
    connection.py      # SQLAlchemy asyncpg engine configuration
  models/
    database_models.py # Declarative mapping of existing tables
  schemas/
    api_schemas.py     # Pydantic v2 validation models
  rag/
    rag_pipeline.py    # Chunking, embeddings & pgvector search
  scripts/
    index_docs.py      # PDF, DOCX, TXT indexer CLI tool
  docs/                # Document vault for RAG ingestion
  main.py              # FastAPI main service entry point
  requirements.txt     # Dependency list
```

## Setup Instructions

1. **Configure Environment:**
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL=postgresql+asyncpg://...
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=8000
   ```

2. **Install Dependencies:**
   Make sure you are using Python 3.11+. It is recommended to create a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Bootstrap RAG Index:**
   Before running the app, index the documentation (this will also create the `document_chunks` table):
   ```bash
   python scripts/index_docs.py
   ```

4. **Run the API:**
   Launch the FastAPI dev server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser to view the interactive OpenAPI documentation.
