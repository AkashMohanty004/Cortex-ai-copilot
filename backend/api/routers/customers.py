from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from database.connection import get_db
from models.database_models import Customer, TelemetryReading
from schemas.api_schemas import CustomerSchema, TelemetryReadingSchema

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerSchema])
async def get_customers(db: AsyncSession = Depends(get_db)):
    """Fetch all customers registered in the system."""
    stmt = select(Customer).order_by(Customer.name)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{id}", response_model=CustomerSchema)
async def get_customer(id: str, db: AsyncSession = Depends(get_db)):
    """Fetch customer details by ID."""
    stmt = select(Customer).where(Customer.id == id)
    result = await db.execute(stmt)
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/{id}/latest", response_model=TelemetryReadingSchema)
async def get_customer_latest(id: str, db: AsyncSession = Depends(get_db)):
    """Fetch the latest telemetry reading for a customer."""
    # First check if customer exists
    customer_stmt = select(Customer).where(Customer.id == id)
    customer_res = await db.execute(customer_stmt)
    if not customer_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Customer not found")

    stmt = (
        select(TelemetryReading)
        .where(TelemetryReading.customer_id == id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(1)
    )
    result = await db.execute(stmt)
    reading = result.scalar_one_or_none()
    if not reading:
        raise HTTPException(status_code=404, detail="No telemetry data found for this customer")
    return reading

@router.get("/{id}/history", response_model=List[TelemetryReadingSchema])
async def get_customer_history(
    id: str,
    limit: int = Query(default=50, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Fetch historical telemetry readings for a customer, ordered by timestamp descending."""
    # First check if customer exists
    customer_stmt = select(Customer).where(Customer.id == id)
    customer_res = await db.execute(customer_stmt)
    if not customer_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Customer not found")

    stmt = (
        select(TelemetryReading)
        .where(TelemetryReading.customer_id == id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(limit)
    )
    result = await db.execute(stmt)
    readings = result.scalars().all()
    # Reverse so the oldest is first, which is standard for charts
    return list(reversed(readings))
