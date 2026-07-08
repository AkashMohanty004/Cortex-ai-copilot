from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from database.connection import get_db
from models.database_models import Report
from schemas.api_schemas import ReportSchema

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportSchema])
async def get_reports(
    customer_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all energy audit and compliance reports, optionally filtered by customer_id."""
    stmt = select(Report)
    if customer_id:
        stmt = stmt.where(Report.customer_id == customer_id)
    stmt = stmt.order_by(desc(Report.date))
    
    result = await db.execute(stmt)
    return result.scalars().all()
