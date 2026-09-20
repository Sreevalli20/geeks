from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from app.database import get_db
from app.models.report import Report
from app.models.user import User
from app.models.claim import Claim
from app.models.skill import Skill
from app.models.evidence import Evidence
from app.models.candidate import Candidate
from app.schemas import ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


@router.post("/candidate/{candidate_id}", response_model=ApiResponse)
async def generate_candidate_report(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get candidate data
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Get claims
    claims = db.query(Claim).filter(Claim.candidate_id == candidate_id).all()
    
    # Get skills
    skills = db.query(Skill).filter(Skill.candidate_id == candidate_id).all()
    
    # Get evidence
    evidence = db.query(Evidence).filter(Evidence.candidate_id == candidate_id).all()
    
    # Calculate statistics
    supported_claims = len([c for c in claims if c.evidence_status == 'Supported'])
    partially_supported_claims = len([c for c in claims if c.evidence_status == 'Partially Supported'])
    unverified_claims = len([c for c in claims if c.evidence_status == 'Unverified'])
    conflicting_claims = len([c for c in claims if c.evidence_status == 'Conflicting'])
    
    proven_skills = len([s for s in skills if s.is_proven])
    total_skills = len(skills)
    
    sections = [
        {
            "title": "Candidate Overview",
            "content": f"{candidate.name} - {candidate.detected_role}",
            "items": [
                f"Email: {candidate.email or 'Not provided'}",
                f"Location: {candidate.location or 'Not provided'}"
            ]
        },
        {
            "title": "Claims Analysis",
            "content": f"Total claims: {len(claims)}",
            "items": [
                f"Supported: {supported_claims}",
                f"Partially Supported: {partially_supported_claims}",
                f"Unverified: {unverified_claims}",
                f"Conflicting: {conflicting_claims}"
            ]
        },
        {
            "title": "Skills Verification",
            "content": f"Total skills: {total_skills}",
            "items": [
                f"Proven skills: {proven_skills}",
                f"Skills requiring evidence: {total_skills - proven_skills}"
            ]
        },
        {
            "title": "Evidence Summary",
            "content": f"Total evidence items: {len(evidence)}",
            "items": [f"{e.evidence_type}: {e.filename}" for e in evidence]
        }
    ]
    
    new_report = Report(
        type="Candidate Proof Report",
        candidate_id=candidate_id,
        candidate_name=candidate.name,
        summary=f"Evidence report for {candidate.name} with {supported_claims} supported claims and {proven_skills} proven skills",
        sections=json.dumps(sections)
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return ApiResponse(
        success=True,
        data={
            "report": {
                "id": str(new_report.id),
                "type": new_report.type,
                "candidate_id": str(new_report.candidate_id),
                "candidate_name": new_report.candidate_name,
                "generated_at": new_report.generated_at.isoformat(),
                "summary": new_report.summary,
                "sections": json.loads(new_report.sections)
            },
            "statistics": {
                "supportedClaims": supported_claims,
                "partiallySupportedClaims": partially_supported_claims,
                "unverifiedClaims": unverified_claims,
                "conflictingClaims": conflicting_claims,
                "provenSkills": proven_skills,
                "totalSkills": total_skills,
                "totalEvidence": len(evidence)
            }
        }
    )


@router.get("/{report_id}", response_model=ApiResponse)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return ApiResponse(
        success=True,
        data={
            "id": str(report.id),
            "type": report.type,
            "candidate_id": str(report.candidate_id),
            "candidate_name": report.candidate_name,
            "generated_at": report.generated_at.isoformat(),
            "summary": report.summary,
            "sections": json.loads(report.sections)
        }
    )
