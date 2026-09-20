from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.sql import func
import uuid
import json
from app.database import Base


class PracticalChallenge(Base):
    __tablename__ = "practical_challenges"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(String(255), nullable=False)
    title = Column(String(500), nullable=False)
    skill_tested = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False)
    why_recommended = Column(Text)
    prompt_text = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String(100))
    instructions = Column(Text)  # JSON string for SQLite
    starter_code = Column(Text)
    expected_output = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("practical_challenges.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    submission_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    filename = Column(String(255))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluation_evidence = Column(Text)
    result = Column(String(100), nullable=False)
    proven_skills = Column(Text)  # JSON string for SQLite
    score_percentage = Column(Integer, nullable=False)
    total_score = Column(Integer)
    explainable_breakdown = Column(Text)  # JSON string for SQLite
