from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
import uuid
from app.database import Base


class VerificationEvent(Base):
    __tablename__ = "verification_events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    event_type = Column(String(100), nullable=False)
    actor = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    action = Column(String(255))
    source_ref = Column(String(255))
