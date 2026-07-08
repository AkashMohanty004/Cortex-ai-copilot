import os
import sys
import asyncio
from dotenv import load_dotenv

# Ensure both the backend folder and the parent are in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
sys.path.append(os.path.dirname(backend_dir))

from database.connection import AsyncSessionLocal, engine
from rag.rag_pipeline import index_document
from sqlalchemy import text

load_dotenv(override=True)

async def create_vector_table():
    """Create the document_chunks table if it doesn't exist."""
    print("Checking database for document_chunks table...")
    async with engine.begin() as conn:
        # Enable vector extension first
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # Create document_chunks table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS document_chunks (
                id SERIAL PRIMARY KEY,
                document_name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                embedding vector(768) NOT NULL
            );
        """))
    print("SUCCESS: vector extension and document_chunks table verified/created successfully.")

async def main():
    await create_vector_table()
    
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
    if not os.path.exists(docs_dir):
        os.makedirs(docs_dir)
        print(f"Created docs directory: {docs_dir}")
        print("Please place PDF, DOCX, or TXT manuals inside it and rerun this script.")
        
        # Write a sample TXT manual about alerts to bootstrap it!
        sample_file = os.path.join(docs_dir, "alert_safety_protocols.txt")
        with open(sample_file, "w", encoding="utf-8") as f:
            f.write("""CORTEX AI - INDUSTRIAL ENERGY MANAGEMENT SAFETY PROTOCOLS

[DOCUMENT ID: PRO-402-CORTEX]
APPROVED BY: Director of Intelligent Operations
DATE: May 15, 2026

1. TRANSFORMER #2 - TEMPERATURE WARNINGS & CRITICAL ALERTS
- Device Model: Siemens GridMaster T-400
- Location: Stuttgart Smart Facility (Plant 4)
- Operational Limits: Nominal operating temperature is 35°C to 45°C.
- Alert Thresholds:
  - Warning State: Exceeds 48.0°C. Actions: Monitor cooling fan power, check grid load balance.
  - Critical State: Exceeds 52.0°C. Actions: Immediately verify coolant pump telemetry, trigger secondary cooling systems, and shift 20% of high-power CNC milling operations to Plant 3. If temperature exceeds 56.0°C, run automatic shutdown sequence.
- Severity levels are classified in DB as 'Critical' or 'Warning'.

2. MAIN INTAKE DB - POWER FACTOR ALERTS
- Location: Munich Grid Center (Substation Alpha)
- Thresholds: Power factor target must be maintained at >= 0.95.
- Correction Actions:
  - If Power Factor drops below 0.90, verify automatic capacitor bank (APFC) relay switching.
  - Check for harmonic distortion percentages (V_R_THD_Pct > 5.0% indicates high non-linear loading).
  - Power Factor recovery sequence: Verify Cap Bank 3 is online; manual override via industrial controller interface if needed.

3. CNC MILLING AREA A - VOLTAGE SAGS
- Device: CNC Heavy Duty Lathe & Milling Station
- Nominal Voltage: 230V Phase-to-Neutral (400V Phase-to-Phase VLL_Avg).
- Warning Threshold: Voltage drops below 215V.
- Critical Threshold: Voltage drops below 208V.
- Emergency Protocol: Sags lasting more than 5 seconds require halting active lathe feed lines to prevent cutting bit fractures and spindle motor damage.
""")
        print(f"Created sample document: {sample_file}")

    # Index all documents in docs/
    files = [os.path.join(docs_dir, f) for f in os.listdir(docs_dir) 
             if os.path.isfile(os.path.join(docs_dir, f)) and f.lower().endswith(('.pdf', '.docx', '.txt'))]
             
    if not files:
        print("No documents found in docs/ directory to index.")
        return

    print(f"Found {len(files)} files to index.")
    
    async with AsyncSessionLocal() as db:
        # Clear existing document chunks to prevent duplicate entries
        print("Clearing previous index chunks...")
        await db.execute(text("TRUNCATE TABLE document_chunks;"))
        await db.commit()
        
        for file in files:
            print(f"Indexing {os.path.basename(file)}...")
            res = await index_document(file, db)
            print(f"Result for {os.path.basename(file)}: {res}")
            
    print("SUCCESS: Document indexing completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
