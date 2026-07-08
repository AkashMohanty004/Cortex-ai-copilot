import os
import logging
from typing import List, Dict, Any, Optional
from google import genai
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.database_models import DocumentChunk
from pypdf import PdfReader
import docx2txt

logger = logging.getLogger("cortex.rag")

# Configure Gemini API
def configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Gemini API services will be unavailable.")
        return False
    
    # If it is an OAuth 2 access token (starts with AQ. or ya29.)
    if api_key.startswith("AQ.") or api_key.startswith("ya29."):
        try:
            from google.oauth2.credentials import Credentials
            creds = Credentials(token=api_key)
            genai.configure(credentials=creds)
            return True
        except Exception as e:
            logger.error(f"Failed to configure Gemini with OAuth credentials: {e}")
            return False

    genai.configure(api_key=api_key)
    return True

# Simple recursive text splitter
def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        if end >= text_len:
            chunks.append(text[start:])
            break
            
        # Try to find a paragraph break or space near the end
        # Search backwards up to chunk_overlap characters for a newline or space
        split_idx = end
        found = False
        for idx in range(end, max(start, end - chunk_overlap), -1):
            if text[idx - 1] == '\n':
                split_idx = idx
                found = True
                break
        
        if not found:
            for idx in range(end, max(start, end - chunk_overlap), -1):
                if text[idx - 1] == ' ':
                    split_idx = idx
                    found = True
                    break
        
        chunks.append(text[start:split_idx].strip())
        start = split_idx - chunk_overlap if found else split_idx
        
    return [c for c in chunks if c.strip()]

async def generate_embedding(text: str) -> Optional[List[float]]:
    """Generate text embeddings using Gemini models/gemini-embedding-001 model."""
    if not configure_gemini():
        return None
    try:
        # Run synchronous SDK call in a thread pool if needed, or directly since it's an API call
        # For simplicity and correctness:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        return result["embedding"]
    except Exception as e:
        logger.error(f"Error generating embedding from Gemini: {e}")
        return None

def extract_text_from_file(file_path: str) -> str:
    """Extract raw text from PDF, DOCX, or TXT file."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    elif ext == ".pdf":
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text
    elif ext == ".docx":
        return docx2txt.process(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

async def index_document(file_path: str, db: AsyncSession) -> Dict[str, Any]:
    """Load, chunk, embed, and store a document in the database."""
    doc_name = os.path.basename(file_path)
    logger.info(f"Indexing document: {doc_name}")
    
    try:
        text = extract_text_from_file(file_path)
    except Exception as e:
        logger.error(f"Failed to read file {file_path}: {e}")
        return {"status": "error", "message": f"Read failed: {e}"}
        
    chunks = split_text(text, chunk_size=1000, chunk_overlap=200)
    logger.info(f"Split {doc_name} into {len(chunks)} chunks.")
    
    indexed_count = 0
    for i, chunk in enumerate(chunks):
        embedding = await generate_embedding(chunk)
        if not embedding:
            # If Gemini API Key is missing, we use a zero-vector so indexing still succeeds for testing
            # text-embedding-004 has 768 dimensions
            embedding = [0.0] * 768
            logger.warning("Using zero-vector embedding for testing because Gemini API key is missing.")
            
        doc_chunk = DocumentChunk(
            document_name=doc_name,
            content=chunk,
            embedding=embedding
        )
        db.add(doc_chunk)
        indexed_count += 1
        
    await db.commit()
    logger.info(f"Successfully indexed {indexed_count} chunks for {doc_name}")
    return {"status": "success", "chunks_indexed": indexed_count}

async def search_relevant_chunks(query: str, db: AsyncSession, limit: int = 5) -> List[DocumentChunk]:
    """Retrieve top-N relevant document chunks using pgvector cosine similarity."""
    query_embedding = await generate_embedding(query)
    if not query_embedding:
        logger.warning("Could not generate embedding for query. Returning empty chunks.")
        return []
        
    # Query using pgvector cosine_distance
    # cosine_distance is a method on the column when it's of type Vector
    stmt = select(DocumentChunk).order_by(
        DocumentChunk.embedding.cosine_distance(query_embedding)
    ).limit(limit)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())
