from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.sql import func
import uuid
import json
from app.database import Base


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    score_explainable = Column(Text, nullable=False)
    score = Column(Integer)
    rubric_breakdown = Column(Text)  # JSON string for SQLite
    verified_skills = Column(Text)  # JSON string for SQLite
    status = Column(String(100), default="Pending")
    evidence_id = Column(String(36))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
