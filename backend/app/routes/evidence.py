from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evidence import Evidence
from app.models.user import User
from app.schemas import EvidenceCreate, EvidenceUpdate, ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/candidate/{candidate_id}", response_model=ApiResponse)
async def get_evidence_by_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    evidence_items = db.query(Evidence).filter(Evidence.candidate_id == candidate_id).order_by(Evidence.uploaded_at.desc()).all()
    
    return ApiResponse(
        success=True,
        data={
            "evidence": [{
                "id": str(e.id),
                "candidate_id": str(e.candidate_id),
                "filename": e.filename,
                "source": e.source,
                "evidence_type": e.evidence_type,
                "file_size": e.file_size,
                "file_type": e.file_type,
                "storage_path": e.storage_path,
                "raw_content": e.raw_content,
                "extraction_snippet": e.extraction_snippet,
                "status": e.status,
                "conflicts": e.conflicts,
                "missing_information": e.missing_information,
                "human_reviewed": e.human_reviewed,
                "reviewer_comment": e.reviewer_comment,
                "confidence_score": e.confidence_score,
                "uploaded_at": e.uploaded_at.isoformat()
            } for e in evidence_items]
        }
    )


@router.get("/{evidence_id}", response_model=ApiResponse)
async def get_evidence(
    evidence_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    return ApiResponse(
        success=True,
        data={
            "evidence": {
                "id": str(evidence.id),
                "candidate_id": str(evidence.candidate_id),
                "filename": evidence.filename,
                "source": evidence.source,
                "evidence_type": evidence.evidence_type,
                "file_size": evidence.file_size,
                "file_type": evidence.file_type,
                "storage_path": evidence.storage_path,
                "raw_content": evidence.raw_content,
                "extraction_snippet": evidence.extraction_snippet,
                "status": evidence.status,
                "conflicts": evidence.conflicts,
                "missing_information": evidence.missing_information,
                "human_reviewed": evidence.human_reviewed,
                "reviewer_comment": evidence.reviewer_comment,
                "confidence_score": evidence.confidence_score,
                "uploaded_at": evidence.uploaded_at.isoformat()
            }
        }
    )


@router.post("/", response_model=ApiResponse)
async def create_evidence(
    evidence_data: EvidenceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not evidence_data.candidate_id or not evidence_data.filename or not evidence_data.evidence_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
        )
    
    new_evidence = Evidence(**evidence_data.model_dump())
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    
    return ApiResponse(
        success=True,
        data={
            "evidence": {
                "id": str(new_evidence.id),
                "candidate_id": str(new_evidence.candidate_id),
                "filename": new_evidence.filename,
                "source": new_evidence.source,
                "evidence_type": new_evidence.evidence_type,
                "file_size": new_evidence.file_size,
                "file_type": new_evidence.file_type,
                "storage_path": new_evidence.storage_path,
                "raw_content": new_evidence.raw_content,
                "extraction_snippet": new_evidence.extraction_snippet,
                "status": new_evidence.status,
                "conflicts": new_evidence.conflicts,
                "missing_information": new_evidence.missing_information,
                "human_reviewed": new_evidence.human_reviewed,
                "reviewer_comment": new_evidence.reviewer_comment,
                "confidence_score": new_evidence.confidence_score,
                "uploaded_at": new_evidence.uploaded_at.isoformat()
            }
        }
    )


@router.put("/{evidence_id}", response_model=ApiResponse)
async def update_evidence(
    evidence_id: str,
    evidence_data: EvidenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    # Update fields
    update_data = evidence_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evidence, field, value)
    
    db.commit()
    db.refresh(evidence)
    
    return ApiResponse(
        success=True,
        data={
            "id": str(evidence.id),
            "candidate_id": str(evidence.candidate_id),
            "filename": evidence.filename,
            "source": evidence.source,
            "evidence_type": evidence.evidence_type,
            "file_size": evidence.file_size,
            "file_type": evidence.file_type,
            "storage_path": evidence.storage_path,
            "raw_content": evidence.raw_content,
            "extraction_snippet": evidence.extraction_snippet,
            "status": evidence.status,
            "conflicts": evidence.conflicts,
            "missing_information": evidence.missing_information,
            "human_reviewed": evidence.human_reviewed,
            "reviewer_comment": evidence.reviewer_comment,
            "confidence_score": evidence.confidence_score,
            "uploaded_at": evidence.uploaded_at.isoformat()
        }
    )


@router.delete("/{evidence_id}", response_model=ApiResponse)
async def delete_evidence(
    evidence_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence not found"
        )
    
    db.delete(evidence)
    db.commit()
    
    return ApiResponse(
        success=True,
        message="Evidence deleted successfully"
    )
