from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas import CandidateCreate, CandidateUpdate, CandidateResponse, ApiResponse
from app.auth import get_current_active_user, require_role

router = APIRouter()


@router.get("/", response_model=ApiResponse)
async def get_all_candidates(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    candidates = db.query(Candidate).order_by(Candidate.created_at.desc()).all()
    
    return ApiResponse(
        success=True,
        data={
            "candidates": [{
                "id": str(c.id),
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "location": c.location,
                "detected_role": c.detected_role,
                "target_role": c.target_role,
                "summary": c.summary,
                "education_degree": c.education_degree,
                "education_institution": c.education_institution,
                "education_graduation_year": c.education_graduation_year,
                "github_url": c.github_url,
                "linkedin_url": c.linkedin_url,
                "portfolio_url": c.portfolio_url,
                "is_development_data": c.is_development_data,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat()
            } for c in candidates]
        }
    )


@router.get("/{candidate_id}", response_model=ApiResponse)
async def get_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    return ApiResponse(
        success=True,
        data={
            "candidate": {
                "id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "location": candidate.location,
                "detected_role": candidate.detected_role,
                "target_role": candidate.target_role,
                "summary": candidate.summary,
                "education_degree": candidate.education_degree,
                "education_institution": candidate.education_institution,
                "education_graduation_year": candidate.education_graduation_year,
                "github_url": candidate.github_url,
                "linkedin_url": candidate.linkedin_url,
                "portfolio_url": candidate.portfolio_url,
                "is_development_data": candidate.is_development_data,
                "created_at": candidate.created_at.isoformat(),
                "updated_at": candidate.updated_at.isoformat()
            }
        }
    )


@router.post("/", response_model=ApiResponse)
async def create_candidate(
    candidate_data: CandidateCreate,
    current_user: User = Depends(require_role("RECRUITER", "ADMIN")),
    db: Session = Depends(get_db)
):
    if not candidate_data.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )
    
    new_candidate = Candidate(**candidate_data.model_dump())
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    
    return ApiResponse(
        success=True,
        data={
            "candidate": {
                "id": str(new_candidate.id),
                "name": new_candidate.name,
                "email": new_candidate.email,
                "phone": new_candidate.phone,
                "location": new_candidate.location,
                "detected_role": new_candidate.detected_role,
                "target_role": new_candidate.target_role,
                "summary": new_candidate.summary,
                "education_degree": new_candidate.education_degree,
                "education_institution": new_candidate.education_institution,
                "education_graduation_year": new_candidate.education_graduation_year,
                "github_url": new_candidate.github_url,
                "linkedin_url": new_candidate.linkedin_url,
                "portfolio_url": new_candidate.portfolio_url,
                "is_development_data": new_candidate.is_development_data,
                "created_at": new_candidate.created_at.isoformat(),
                "updated_at": new_candidate.updated_at.isoformat()
            }
        }
    )


@router.put("/{candidate_id}", response_model=ApiResponse)
async def update_candidate(
    candidate_id: str,
    candidate_data: CandidateUpdate,
    current_user: User = Depends(require_role("RECRUITER", "ADMIN")),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Update fields
    update_data = candidate_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)
    
    db.commit()
    db.refresh(candidate)
    
    return ApiResponse(
        success=True,
        data={
            "candidate": {
                "id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "location": candidate.location,
                "detected_role": candidate.detected_role,
                "target_role": candidate.target_role,
                "summary": candidate.summary,
                "education_degree": candidate.education_degree,
                "education_institution": candidate.education_institution,
                "education_graduation_year": candidate.education_graduation_year,
                "github_url": candidate.github_url,
                "linkedin_url": candidate.linkedin_url,
                "portfolio_url": candidate.portfolio_url,
                "is_development_data": candidate.is_development_data,
                "created_at": candidate.created_at.isoformat(),
                "updated_at": candidate.updated_at.isoformat()
            }
        }
    )


@router.delete("/{candidate_id}", response_model=ApiResponse)
async def delete_candidate(
    candidate_id: str,
    current_user: User = Depends(require_role("RECRUITER", "ADMIN")),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    db.delete(candidate)
    db.commit()
    
    return ApiResponse(
        success=True,
        message="Candidate deleted successfully"
    )
