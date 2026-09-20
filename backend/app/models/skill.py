from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    resume_claim_level = Column(String(100))
    evidence_count = Column(Integer, default=0)
    verification_state = Column(String(100), default="Not Yet Verified")
    evidence_strength = Column(String(100), default="None")
    missing_proof_reason = Column(Text)
    recommended_validation = Column(Text)
    is_proven = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    candidate = relationship("Candidate", back_populates="skills")
