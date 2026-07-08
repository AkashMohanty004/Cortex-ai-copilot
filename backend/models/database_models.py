from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class Customer(Base):
    __tablename__ = 'customers'

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    telemetry_readings = relationship("TelemetryReading", back_populates="customer", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="customer", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="customer", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="customer", cascade="all, delete-orphan")

class TelemetryReading(Base):
    __tablename__ = 'telemetry_readings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey('customers.id', ondelete='CASCADE'), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    apparent_power = Column(Float, nullable=False)
    frequency = Column(Float, nullable=False)
    power_factor = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    voltage_phase1 = Column(Float, nullable=True)
    voltage_phase2 = Column(Float, nullable=True)
    voltage_phase3 = Column(Float, nullable=True)
    current_phase1 = Column(Float, nullable=True)
    current_phase2 = Column(Float, nullable=True)
    current_phase3 = Column(Float, nullable=True)
    energy_today = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="telemetry_readings")

class Alert(Base):
    __tablename__ = 'alerts'

    id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey('customers.id', ondelete='CASCADE'), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    severity = Column(String(20), nullable=False)
    source = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), nullable=False)
    value = Column(String(50), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="alerts")

class Report(Base):
    __tablename__ = 'reports'

    id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey('customers.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(String(20), nullable=False)
    file_path = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="reports")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey('customers.id', ondelete='CASCADE'), nullable=False)
    sender = Column(String(10), nullable=False)  # 'user' or 'assistant'
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    chart_type = Column(String(20), nullable=True)
    code_block = Column(Text, nullable=True)
    references_list = Column(JSONB, nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="chat_messages")

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)  # Gemini embedding size
