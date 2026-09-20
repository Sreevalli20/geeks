from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(CANDIDATE|RECRUITER|ADMIN)$")


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    detected_role: Optional[str] = None
    target_role: Optional[str] = None
    summary: Optional[str] = None
    education_degree: Optional[str] = None
    education_institution: Optional[str] = None
    education_graduation_year: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(CandidateBase):
    pass


class CandidateResponse(CandidateBase):
    id: uuid.UUID
    is_development_data: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Claim Schemas
class ClaimBase(BaseModel):
    title: str
    claim_type: str
    source: str
    description: Optional[str] = None
    declared_level: Optional[str] = None


class ClaimCreate(ClaimBase):
    candidate_id: uuid.UUID


class ClaimUpdate(BaseModel):
    evidence_status: Optional[str] = None
    reviewed_by_human: Optional[bool] = None
    reviewer_notes: Optional[str] = None


class ClaimResponse(ClaimBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    evidence_status: str = "Unverified"
    reviewed_by_human: bool = False
    reviewer_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Skill Schemas
class SkillBase(BaseModel):
    name: str
    category: str
    resume_claim_level: Optional[str] = None


class SkillCreate(SkillBase):
    candidate_id: uuid.UUID


class SkillUpdate(BaseModel):
    evidence_count: Optional[int] = None
    verification_state: Optional[str] = None
    evidence_strength: Optional[str] = None
    missing_proof_reason: Optional[str] = None
    recommended_validation: Optional[str] = None
    is_proven: Optional[bool] = None


class SkillResponse(SkillBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    evidence_count: int = 0
    verification_state: str = "Not Yet Verified"
    evidence_strength: str = "None"
    missing_proof_reason: Optional[str] = None
    recommended_validation: Optional[str] = None
    is_proven: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Evidence Schemas
class EvidenceBase(BaseModel):
    filename: str
    source: str
    evidence_type: str
    file_size: int
    file_type: Optional[str] = None
    storage_path: Optional[str] = None
    raw_content: Optional[str] = None
    extraction_snippet: Optional[str] = None
    status: str = "EXTRACTED"
    confidence_score: Optional[int] = None


class EvidenceCreate(EvidenceBase):
    candidate_id: uuid.UUID


class EvidenceUpdate(BaseModel):
    status: Optional[str] = None
    human_reviewed: Optional[bool] = None
    reviewer_comment: Optional[str] = None


class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    conflicts: Optional[str] = None
    missing_information: Optional[str] = None
    human_reviewed: bool = False
    reviewer_comment: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Challenge Schemas
class ChallengeResponse(BaseModel):
    id: uuid.UUID
    role: str
    title: str
    skill_tested: str
    difficulty: str
    why_recommended: Optional[str] = None
    prompt_text: str
    description: Optional[str] = None
    category: Optional[str] = None
    instructions: Optional[List[str]] = None
    starter_code: Optional[str] = None
    expected_output: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChallengeSubmissionCreate(BaseModel):
    challenge_id: uuid.UUID
    candidate_id: uuid.UUID
    submission_type: str
    content: str
    filename: Optional[str] = None


class ChallengeSubmissionResponse(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    candidate_id: uuid.UUID
    submission_type: str
    content: str
    filename: Optional[str] = None
    submitted_at: datetime
    evaluation_evidence: Optional[str] = None
    result: str
    proven_skills: Optional[List[str]] = None
    score_percentage: int
    total_score: Optional[int] = None
    explainable_breakdown: Optional[List[str]] = None
    
    class Config:
        from_attributes = True


# Assessment Schemas
class AssessmentCreate(BaseModel):
    candidate_id: uuid.UUID
    title: str
    category: str
    date: datetime
    score_explainable: str
    score: Optional[int] = None
    verified_skills: Optional[List[str]] = None


class AssessmentResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    title: str
    category: str
    date: datetime
    score_explainable: str
    score: Optional[int] = None
    rubric_breakdown: Optional[dict] = None
    verified_skills: Optional[List[str]] = None
    status: str = "Pending"
    evidence_id: Optional[uuid.UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Report Schemas
class ReportResponse(BaseModel):
    id: uuid.UUID
    type: str
    candidate_id: uuid.UUID
    candidate_name: str
    generated_at: datetime
    summary: str
    sections: dict
    
    class Config:
        from_attributes = True


# Generic Response
class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None
    error: Optional[str] = None
