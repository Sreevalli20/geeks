from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.verification import VerificationEvent
from app.schemas import ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/candidate/{candidate_id}", response_model=ApiResponse)
async def get_verification_events(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    events = db.query(VerificationEvent).filter(
        VerificationEvent.candidate_id == candidate_id
    ).order_by(VerificationEvent.timestamp.desc()).all()
    
    return ApiResponse(
        success=True,
        data=[{
            "id": str(e.id),
            "candidate_id": str(e.candidate_id),
            "timestamp": e.timestamp.isoformat(),
            "event_type": e.event_type,
            "actor": e.actor,
            "details": e.details,
            "action": e.action,
            "source_ref": e.source_ref
        } for e in events]
    )
