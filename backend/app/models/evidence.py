from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    evidence_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(100))
    storage_path = Column(String(500))
    raw_content = Column(Text)
    extraction_snippet = Column(Text)
    status = Column(String(100), default="EXTRACTED")
    conflicts = Column(Text)
    missing_information = Column(Text)
    human_reviewed = Column(Boolean, default=False)
    reviewer_comment = Column(Text)
    confidence_score = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    candidate = relationship("Candidate", back_populates="evidence")
