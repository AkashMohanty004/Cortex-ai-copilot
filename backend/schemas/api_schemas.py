from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional, Any

# Common Base Config for Pydantic v2
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class CustomerSchema(BaseSchema):
    id: str
    name: str
    location: str
    role: str
    created_at: Optional[datetime] = None

class TelemetryReadingSchema(BaseSchema):
    id: int
    customer_id: str
    timestamp: datetime
    voltage: float
    current: float
    power: float
    apparent_power: float
    frequency: float
    power_factor: float
    temperature: float
    status: str
    voltage_phase1: Optional[float] = None
    voltage_phase2: Optional[float] = None
    voltage_phase3: Optional[float] = None
    current_phase1: Optional[float] = None
    current_phase2: Optional[float] = None
    current_phase3: Optional[float] = None
    energy_today: Optional[float] = None
    health_score: Optional[float] = None

class AlertSchema(BaseSchema):
    id: str
    customer_id: str
    timestamp: datetime
    severity: str
    source: str
    message: str
    status: str
    value: Optional[str] = None

class ReportSchema(BaseSchema):
    id: str
    customer_id: str
    name: str
    date: date
    file_type: str
    file_size: str
    file_path: str
    created_at: Optional[datetime] = None

class ChatMessageSchema(BaseSchema):
    id: int
    customer_id: str
    sender: str
    text: str
    timestamp: datetime
    chart_type: Optional[str] = None
    code_block: Optional[str] = None
    references_list: Optional[List[Any]] = None

class ChatMessageCreate(BaseModel):
    sender: str
    text: str
    chart_type: Optional[str] = None
    code_block: Optional[str] = None
    references_list: Optional[List[Any]] = None

class ChatRequest(BaseModel):
    message: str
    customer_id: str

class CitedSource(BaseModel):
    document_name: str
    snippet: str

class ChatResponse(BaseModel):
    reply: str
    cited_sources: List[CitedSource]
    chart_type: Optional[str] = None
    code_block: Optional[str] = None

class MetricSummary(BaseModel):
    current: float
    change_pct: float
    status: str  # 'normal', 'warning', 'critical'

class DashboardSummary(BaseModel):
    customer_id: str
    voltage: MetricSummary
    current: MetricSummary
    power: MetricSummary
    power_factor: MetricSummary
    frequency: MetricSummary
    energy: MetricSummary
    active_alerts_count: int
    health_score: float
    recent_alerts: List[AlertSchema]

class ChartDataPoint(BaseModel):
    timestamp: str
    voltage: float
    current: float
    power: float
    power_factor: float
    frequency: float
    energy: float
    temperature: float

class DashboardCharts(BaseModel):
    customer_id: str
    data: List[ChartDataPoint]
