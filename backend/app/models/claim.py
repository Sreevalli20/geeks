from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    claim_type = Column(String(100), nullable=False)
    source = Column(String(100), nullable=False)
    description = Column(Text)
    declared_level = Column(String(50))
    evidence_status = Column(String(100), default="Unverified")
    reviewed_by_human = Column(Boolean, default=False)
    reviewer_notes = Column(Text)
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    candidate = relationship("Candidate", back_populates="claims")
