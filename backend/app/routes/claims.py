from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.claim import Claim
from app.models.user import User
from app.schemas import ClaimCreate, ClaimUpdate, ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/candidate/{candidate_id}", response_model=ApiResponse)
async def get_claims_by_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claims = db.query(Claim).filter(Claim.candidate_id == candidate_id).order_by(Claim.created_at.desc()).all()
    
    return ApiResponse(
        success=True,
        data={
            "claims": [{
                "id": str(c.id),
                "candidate_id": str(c.candidate_id),
                "title": c.title,
                "claim_type": c.claim_type,
                "source": c.source,
                "description": c.description,
                "declared_level": c.declared_level,
                "evidence_status": c.evidence_status,
                "reviewed_by_human": c.reviewed_by_human,
                "reviewer_notes": c.reviewer_notes,
                "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None,
                "created_at": c.created_at.isoformat()
            } for c in claims]
        }
    )


@router.get("/{claim_id}", response_model=ApiResponse)
async def get_claim(
    claim_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    return ApiResponse(
        success=True,
        data={
            "claim": {
                "id": str(claim.id),
                "candidate_id": str(claim.candidate_id),
                "title": claim.title,
                "claim_type": claim.claim_type,
                "source": claim.source,
                "description": claim.description,
                "declared_level": claim.declared_level,
                "evidence_status": claim.evidence_status,
                "reviewed_by_human": claim.reviewed_by_human,
                "reviewer_notes": claim.reviewer_notes,
                "reviewed_at": claim.reviewed_at.isoformat() if claim.reviewed_at else None,
                "created_at": claim.created_at.isoformat()
            }
        }
    )


@router.post("/", response_model=ApiResponse)
async def create_claim(
    claim_data: ClaimCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not claim_data.candidate_id or not claim_data.title or not claim_data.claim_type or not claim_data.source:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
        )
    
    new_claim = Claim(**claim_data.model_dump())
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    
    return ApiResponse(
        success=True,
        data={
            "claim": {
                "id": str(new_claim.id),
                "candidate_id": str(new_claim.candidate_id),
                "title": new_claim.title,
                "claim_type": new_claim.claim_type,
                "source": new_claim.source,
                "description": new_claim.description,
                "declared_level": new_claim.declared_level,
                "evidence_status": new_claim.evidence_status,
                "reviewed_by_human": new_claim.reviewed_by_human,
                "reviewer_notes": new_claim.reviewer_notes,
                "reviewed_at": new_claim.reviewed_at.isoformat() if new_claim.reviewed_at else None,
                "created_at": new_claim.created_at.isoformat()
            }
        }
    )


@router.put("/{claim_id}", response_model=ApiResponse)
async def update_claim(
    claim_id: str,
    claim_data: ClaimUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )
    
    # Update fields
    update_data = claim_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(claim, field, value)
    
    if claim_data.reviewed_by_human and not claim.reviewed_at:
        from datetime import datetime
        claim.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(claim)
    
    return ApiResponse(
        success=True,
        data={
            "claim": {
                "id": str(claim.id),
                "candidate_id": str(claim.candidate_id),
                "title": claim.title,
                "claim_type": claim.claim_type,
                "source": claim.source,
                "description": claim.description,
                "declared_level": claim.declared_level,
                "evidence_status": claim.evidence_status,
                "reviewed_by_human": claim.reviewed_by_human,
                "reviewer_notes": claim.reviewer_notes,
                "reviewed_at": claim.reviewed_at.isoformat() if claim.reviewed_at else None,
                "created_at": claim.created_at.isoformat()
            }
        }
    )
