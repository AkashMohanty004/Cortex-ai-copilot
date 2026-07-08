from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from datetime import datetime
from database.connection import get_db
from models.database_models import Customer, TelemetryReading, Alert
from schemas.api_schemas import DashboardSummary, DashboardCharts, MetricSummary, AlertSchema, ChartDataPoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

async def get_default_customer_id(db: AsyncSession) -> str:
    """Helper to get the first customer ID if none is provided."""
    stmt = select(Customer.id).order_by(Customer.name).limit(1)
    result = await db.execute(stmt)
    customer_id = result.scalar_one_or_none()
    if not customer_id:
        raise HTTPException(status_code=404, detail="No customers found in database")
    return customer_id

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    customer_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """Fetch dashboard summary numbers, status, and alerts for a given customer."""
    if not customer_id:
        customer_id = await get_default_customer_id(db)

    # Get the latest 2 readings to calculate the percentage changes
    stmt = (
        select(TelemetryReading)
        .where(TelemetryReading.customer_id == customer_id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(2)
    )
    result = await db.execute(stmt)
    readings = result.scalars().all()

    if not readings:
        raise HTTPException(status_code=404, detail=f"No telemetry readings found for customer {customer_id}")

    latest = readings[0]
    previous = readings[1] if len(readings) > 1 else None

    # Helper to calculate changes
    def calc_metric(curr_val: float, prev_val: Optional[float], low_lim: float, high_lim: float) -> MetricSummary:
        change = 0.0
        if prev_val and prev_val != 0:
            change = round(((curr_val - prev_val) / prev_val) * 100, 2)
        
        status = "normal"
        if curr_val < low_lim or curr_val > high_lim:
            status = "critical"
        elif curr_val < (low_lim * 1.05) or curr_val > (high_lim * 0.95):
            status = "warning"
            
        return MetricSummary(current=round(curr_val, 2), change_pct=change, status=status)

    # Calculate limits for each
    # Voltage (Nominal 400V L-L) -> limits: 380V to 420V
    # Current -> limit up to 1000A
    # Power -> limit up to 800kW
    # Power Factor -> target > 0.95 (Warning < 0.92, Critical < 0.90)
    # Frequency -> 49.5Hz to 50.5Hz
    # Energy -> cumulative, limit up to 10000kWh per day
    voltage_stat = calc_metric(latest.voltage, previous.voltage if previous else None, 380.0, 420.0)
    current_stat = calc_metric(latest.current, previous.current if previous else None, 0.0, 900.0)
    power_stat = calc_metric(latest.power, previous.power if previous else None, 0.0, 600.0)
    
    # Custom PF logic since higher is better
    pf_val = latest.power_factor
    pf_change = 0.0
    if previous and previous.power_factor != 0:
        pf_change = round(((pf_val - previous.power_factor) / previous.power_factor) * 100, 2)
    pf_status = "normal"
    if pf_val < 0.90:
        pf_status = "critical"
    elif pf_val < 0.95:
        pf_status = "warning"
    pf_stat = MetricSummary(current=round(pf_val, 3), change_pct=pf_change, status=pf_status)

    freq_stat = calc_metric(latest.frequency, previous.frequency if previous else None, 49.8, 50.2)
    
    # Energy Today is cumulative, change is positive always
    energy_val = latest.energy_today if latest.energy_today is not None else 0.0
    prev_energy_val = previous.energy_today if previous and previous.energy_today is not None else 0.0
    energy_change = round(energy_val - prev_energy_val, 3)
    energy_stat = MetricSummary(current=round(energy_val, 2), change_pct=energy_change, status="normal")

    # Count active alerts
    alert_count_stmt = (
        select(func.count(Alert.id))
        .where(Alert.customer_id == customer_id)
        .where(Alert.status == "Active")
    )
    alert_count_res = await db.execute(alert_count_stmt)
    active_alerts_count = alert_count_res.scalar() or 0

    # Get recent alerts (Active or Closed, limit 5)
    alerts_stmt = (
        select(Alert)
        .where(Alert.customer_id == customer_id)
        .order_by(desc(Alert.timestamp))
        .limit(5)
    )
    alerts_res = await db.execute(alerts_stmt)
    recent_alerts = alerts_res.scalars().all()

    # Health score
    health_score = latest.health_score if latest.health_score is not None else 100.0

    return DashboardSummary(
        customer_id=customer_id,
        voltage=voltage_stat,
        current=current_stat,
        power=power_stat,
        power_factor=pf_stat,
        frequency=freq_stat,
        energy=energy_stat,
        active_alerts_count=active_alerts_count,
        health_score=health_score,
        recent_alerts=[AlertSchema.model_validate(a) for a in recent_alerts]
    )

@router.get("/charts", response_model=DashboardCharts)
async def get_dashboard_charts(
    customer_id: Optional[str] = Query(default=None),
    limit: int = Query(default=30, ge=5, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Fetch time-series chart data points for the given customer."""
    if not customer_id:
        customer_id = await get_default_customer_id(db)

    stmt = (
        select(TelemetryReading)
        .where(TelemetryReading.customer_id == customer_id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(limit)
    )
    result = await db.execute(stmt)
    readings = result.scalars().all()

    # Sort in chronological order (oldest to newest) for chart plotting
    readings_sorted = list(reversed(readings))

    chart_points = []
    for r in readings_sorted:
        # Format timestamp to readable time string (e.g. HH:MM)
        ts_str = r.timestamp.strftime("%H:%M:%S")
        chart_points.append(
            ChartDataPoint(
                timestamp=ts_str,
                voltage=round(r.voltage, 2),
                current=round(r.current, 2),
                power=round(r.power, 2),
                power_factor=round(r.power_factor, 3),
                frequency=round(r.frequency, 2),
                energy=round(r.energy_today if r.energy_today is not None else 0.0, 2),
                temperature=round(r.temperature, 2)
            )
        )

    return DashboardCharts(
        customer_id=customer_id,
        data=chart_points
    )
