from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    detected_role = Column(String(255))
    target_role = Column(String(255))
    summary = Column(Text)
    education_degree = Column(String(255))
    education_institution = Column(String(255))
    education_graduation_year = Column(String(10))
    github_url = Column(String(500))
    linkedin_url = Column(String(500))
    portfolio_url = Column(String(500))
    is_development_data = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    claims = relationship("Claim", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="candidate", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="candidate", cascade="all, delete-orphan")
