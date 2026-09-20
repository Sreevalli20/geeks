from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from app.database import get_db
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas import AssessmentCreate, ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/candidate/{candidate_id}", response_model=ApiResponse)
async def get_assessments_by_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.candidate_id == candidate_id
    ).order_by(Assessment.date.desc()).all()
    
    return ApiResponse(
        success=True,
        data={
            "assessments": [{
                "id": str(a.id),
                "candidate_id": str(a.candidate_id),
                "title": a.title,
                "category": a.category,
                "date": a.date.isoformat(),
                "score_explainable": a.score_explainable,
                "score": a.score,
                "rubric_breakdown": json.loads(a.rubric_breakdown) if a.rubric_breakdown else None,
                "verified_skills": json.loads(a.verified_skills) if a.verified_skills else [],
                "status": a.status,
                "evidence_id": str(a.evidence_id) if a.evidence_id else None,
                "created_at": a.created_at.isoformat()
            } for a in assessments]
        }
    )


@router.post("/", response_model=ApiResponse)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not assessment_data.candidate_id or not assessment_data.title or not assessment_data.category or not assessment_data.score_explainable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
        )
    
    new_assessment = Assessment(
        candidate_id=assessment_data.candidate_id,
        title=assessment_data.title,
        category=assessment_data.category,
        date=assessment_data.date,
        score_explainable=assessment_data.score_explainable,
        score=assessment_data.score,
        rubric_breakdown=json.dumps(assessment_data.rubric_breakdown) if assessment_data.rubric_breakdown else None,
        verified_skills=json.dumps(assessment_data.verified_skills) if assessment_data.verified_skills else None,
        status="Completed"
    )
    
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    return ApiResponse(
        success=True,
        data={
            "assessment": {
                "id": str(new_assessment.id),
                "candidate_id": str(new_assessment.candidate_id),
                "title": new_assessment.title,
                "category": new_assessment.category,
                "date": new_assessment.date.isoformat(),
                "score_explainable": new_assessment.score_explainable,
                "score": new_assessment.score,
                "rubric_breakdown": json.loads(new_assessment.rubric_breakdown) if new_assessment.rubric_breakdown else None,
                "verified_skills": json.loads(new_assessment.verified_skills) if new_assessment.verified_skills else [],
                "status": new_assessment.status,
                "evidence_id": str(new_assessment.evidence_id) if new_assessment.evidence_id else None,
                "created_at": new_assessment.created_at.isoformat()
            }
        }
    )
