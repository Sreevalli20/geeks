from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.skill import Skill
from app.models.user import User
from app.schemas import SkillCreate, SkillUpdate, ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/candidate/{candidate_id}", response_model=ApiResponse)
async def get_skills_by_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).filter(Skill.candidate_id == candidate_id).order_by(Skill.created_at.desc()).all()
    
    return ApiResponse(
        success=True,
        data={
            "skills": [{
                "id": str(s.id),
                "candidate_id": str(s.candidate_id),
                "name": s.name,
                "category": s.category,
                "resume_claim_level": s.resume_claim_level,
                "evidence_count": s.evidence_count,
                "verification_state": s.verification_state,
                "evidence_strength": s.evidence_strength,
                "missing_proof_reason": s.missing_proof_reason,
                "recommended_validation": s.recommended_validation,
                "is_proven": s.is_proven,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat()
            } for s in skills]
        }
    )


@router.get("/{skill_id}", response_model=ApiResponse)
async def get_skill(
    skill_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return ApiResponse(
        success=True,
        data={
            "skill": {
                "id": str(skill.id),
                "candidate_id": str(skill.candidate_id),
                "name": skill.name,
                "category": skill.category,
                "resume_claim_level": skill.resume_claim_level,
                "evidence_count": skill.evidence_count,
                "verification_state": skill.verification_state,
                "evidence_strength": skill.evidence_strength,
                "missing_proof_reason": skill.missing_proof_reason,
                "recommended_validation": skill.recommended_validation,
                "is_proven": skill.is_proven,
                "created_at": skill.created_at.isoformat(),
                "updated_at": skill.updated_at.isoformat()
            }
        }
    )


@router.post("/", response_model=ApiResponse)
async def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not skill_data.candidate_id or not skill_data.name or not skill_data.category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
        )
    
    new_skill = Skill(**skill_data.model_dump())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    return ApiResponse(
        success=True,
        data={
            "skill": {
                "id": str(new_skill.id),
                "candidate_id": str(new_skill.candidate_id),
                "name": new_skill.name,
                "category": new_skill.category,
                "resume_claim_level": new_skill.resume_claim_level,
                "evidence_count": new_skill.evidence_count,
                "verification_state": new_skill.verification_state,
                "evidence_strength": new_skill.evidence_strength,
                "missing_proof_reason": new_skill.missing_proof_reason,
                "recommended_validation": new_skill.recommended_validation,
                "is_proven": new_skill.is_proven,
                "created_at": new_skill.created_at.isoformat(),
                "updated_at": new_skill.updated_at.isoformat()
            }
        }
    )


@router.put("/{skill_id}", response_model=ApiResponse)
async def update_skill(
    skill_id: str,
    skill_data: SkillUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Update fields
    update_data = skill_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
    
    db.commit()
    db.refresh(skill)
    
    return ApiResponse(
        success=True,
        data={
            "skill": {
                "id": str(skill.id),
                "candidate_id": str(skill.candidate_id),
                "name": skill.name,
                "category": skill.category,
                "resume_claim_level": skill.resume_claim_level,
                "evidence_count": skill.evidence_count,
                "verification_state": skill.verification_state,
                "evidence_strength": skill.evidence_strength,
                "missing_proof_reason": skill.missing_proof_reason,
                "recommended_validation": skill.recommended_validation,
                "is_proven": skill.is_proven,
                "created_at": skill.created_at.isoformat(),
                "updated_at": skill.updated_at.isoformat()
            }
        }
    )
