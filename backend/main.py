import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text

# Load env variables
load_dotenv(override=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("cortex.main")

from database.connection import engine
from api.routers import customers, dashboard, reports, copilot

app = FastAPI(
    title="Cortex AI Backend API",
    description="FastAPI service for Industrial Energy Monitoring & AI Copilot",
    version="1.0.0",
)

# CORS configuration
# Allow standard localhost development ports for Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:80",
    "https://cortex-ai-copilot.vercel.app",
    "http://cortex-ai-copilot.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://cortex-ai-copilot-.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(customers.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")

@app.get("/health", tags=["Health"])
async def health_check():
    """Verify backend status and DB connection."""
    db_status = "unknown"
    try:
        # Check connection using engine.connect()
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT 1;"))
            val = res.scalar()
            if val == 1:
                db_status = "connected"
    except Exception as e:
        logger.error(f"Health check database connection failure: {e}")
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "gemini_api_key_configured": os.getenv("GEMINI_API_KEY") is not None and os.getenv("GEMINI_API_KEY") != ""
    }

@app.on_event("startup")
async def startup_event():
    logger.info("Cortex AI API is booting up...")
    try:
        # Verify db connection on startup
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1;"))
            logger.info("Successfully connected to Supabase PostgreSQL.")
    except Exception as e:
        logger.critical(f"Failed to connect to database on startup: {e}")
