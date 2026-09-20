from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.evidence import Evidence
from app.models.verification import VerificationEvent
from app.schemas import ApiResponse
from app.auth import get_current_active_user
from app.services.resume_parser import extract_resume_text, parse_resume_data

router = APIRouter()


@router.post("/resume", response_model=ApiResponse)
async def upload_resume(
    file: UploadFile = File(...),
    candidate_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded"
        )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Extract text from resume
    try:
        extracted_text = extract_resume_text(file_content, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from resume: {str(e)}"
        )
    
    # Parse resume data
    parsed_data = parse_resume_data(extracted_text, file.filename)
    
    # Create or update candidate
    if candidate_id:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if candidate:
            # Update existing candidate
            candidate.name = parsed_data.get("name", candidate.name)
            candidate.email = parsed_data.get("email", candidate.email)
            candidate.phone = parsed_data.get("phone") if parsed_data.get("phone") != "NOT FOUND" else candidate.phone
            candidate.location = parsed_data.get("location") if parsed_data.get("location") != "NOT FOUND" else candidate.location
            candidate.detected_role = parsed_data.get("detected_role", candidate.detected_role)
            candidate.summary = parsed_data.get("summary", candidate.summary)
            candidate.education_degree = parsed_data.get("degree") if parsed_data.get("degree") != "NOT FOUND" else candidate.education_degree
            candidate.education_institution = parsed_data.get("institution") if parsed_data.get("institution") != "NOT FOUND" else candidate.education_institution
            candidate.education_graduation_year = parsed_data.get("graduation_year") if parsed_data.get("graduation_year") != "NOT FOUND" else candidate.education_graduation_year
            candidate.github_url = parsed_data.get("links", {}).get("github") or candidate.github_url
            candidate.linkedin_url = parsed_data.get("links", {}).get("linkedin") or candidate.linkedin_url
            candidate.portfolio_url = parsed_data.get("links", {}).get("portfolio") or candidate.portfolio_url
            db.commit()
            db.refresh(candidate)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found"
            )
    else:
        # Create new candidate
        candidate = Candidate(
            name=parsed_data.get("name", "Candidate Requiring Review"),
            email=parsed_data.get("email"),
            phone=parsed_data.get("phone") if parsed_data.get("phone") != "NOT FOUND" else None,
            location=parsed_data.get("location") if parsed_data.get("location") != "NOT FOUND" else None,
            detected_role=parsed_data.get("detected_role", "Software Engineer"),
            target_role=parsed_data.get("detected_role", "Software Engineer"),
            summary=parsed_data.get("summary", "Extracted from submitted resume."),
            education_degree=parsed_data.get("degree") if parsed_data.get("degree") != "NOT FOUND" else None,
            education_institution=parsed_data.get("institution") if parsed_data.get("institution") != "NOT FOUND" else None,
            education_graduation_year=parsed_data.get("graduation_year") if parsed_data.get("graduation_year") != "NOT FOUND" else None,
            github_url=parsed_data.get("links", {}).get("github"),
            linkedin_url=parsed_data.get("links", {}).get("linkedin"),
            portfolio_url=parsed_data.get("links", {}).get("portfolio")
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
    
    # Store resume record
    resume = Resume(
        candidate_id=candidate.id,
        filename=file.filename,
        file_size=file_size,
        file_type=file.content_type,
        raw_text=extracted_text,
        parse_status="Extracted",
        extracted_skills_count=len(parsed_data.get("skills", [])),
        extracted_projects_count=len(parsed_data.get("projects", []))
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    # Create evidence record
    evidence = Evidence(
        candidate_id=candidate.id,
        filename=file.filename,
        source="Resume Upload",
        evidence_type="Resume",
        file_size=file_size,
        file_type=file.content_type,
        raw_content=extracted_text[:5000] if extracted_text else None,
        extraction_snippet=f"Resume processed: {candidate.name} with {len(parsed_data.get('skills', []))} detected skills",
        status="EXTRACTED"
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    # Create verification event
    verification_event = VerificationEvent(
        candidate_id=candidate.id,
        event_type="Resume Uploaded",
        actor="Upload Center",
        details=f"Resume {file.filename} uploaded and processed successfully",
        source_ref=str(resume.id)
    )
    db.add(verification_event)
    db.commit()
    
    # Create skills from parsed data
    from app.models.skill import Skill
    from app.models.claim import Claim
    
    for skill_data in parsed_data.get("skills", []):
        # Create skill
        skill = Skill(
            candidate_id=candidate.id,
            name=skill_data.get("name"),
            category=skill_data.get("category"),
            resume_claim_level=skill_data.get("level", "Mentioned in Resume")
        )
        db.add(skill)
        db.commit()
        
        # Create claim
        claim = Claim(
            candidate_id=candidate.id,
            title=skill_data.get("name"),
            claim_type="Technical Skill",
            source="Resume",
            description=f"Extracted from resume: {skill_data.get('name')} at level {skill_data.get('level')}",
            declared_level=skill_data.get("level")
        )
        db.add(claim)
        db.commit()
    
    return ApiResponse(
        success=True,
        data={
            "candidate": {
                "id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "detected_role": candidate.detected_role,
                "keySkills": [s.get("name") for s in parsed_data.get("skills", [])]
            },
            "resume": {
                "id": str(resume.id),
                "filename": resume.filename,
                "file_size": resume.file_size,
                "parse_status": resume.parse_status
            },
            "evidence": {
                "id": str(evidence.id),
                "filename": evidence.filename,
                "status": evidence.status
            }
        }
    )


@router.post("/evidence", response_model=ApiResponse)
async def upload_evidence(
    files: list[UploadFile] = File(...),
    candidate_id: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files uploaded"
        )
    
    if not candidate_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate ID is required"
        )
    
    evidence_records = []
    
    for file in files:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Try to read as text
        try:
            file_text = file_content.decode('utf-8')
            snippet = file_text[:220] if file_text else ""
        except:
            file_text = None
            snippet = "Binary file content"
        
        # Determine evidence type
        evidence_type = "Other"
        if file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            evidence_type = "Document"
        elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            evidence_type = "Image"
        elif file.filename.lower().endswith(('.zip', '.tar', '.gz')):
            evidence_type = "Project"
        elif file.filename.lower().endswith(('.py', '.js', '.ts', '.java', '.cpp', '.go')):
            evidence_type = "Source Code"
        
        evidence = Evidence(
            candidate_id=candidate_id,
            filename=file.filename,
            source="Evidence Upload",
            evidence_type=evidence_type,
            file_size=file_size,
            file_type=file.content_type,
            raw_content=file_text,
            extraction_snippet=snippet,
            status="EXTRACTED"
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        
        evidence_records.append({
            "id": str(evidence.id),
            "filename": evidence.filename,
            "evidence_type": evidence.evidence_type,
            "status": evidence.status
        })
    
    # Create verification event
    verification_event = VerificationEvent(
        candidate_id=candidate_id,
        event_type="Evidence Uploaded",
        actor="Upload Center",
        details=f"{len(evidence_records)} evidence files uploaded successfully"
    )
    db.add(verification_event)
    db.commit()
    
    return ApiResponse(
        success=True,
        data={
            "evidence_records": evidence_records
        }
    )
