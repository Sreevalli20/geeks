from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
import re
from app.database import get_db
from app.models.user import User
from app.models.evidence import Evidence
from app.models.candidate import Candidate
from app.config import settings
from app.schemas import ApiResponse
from app.auth import get_current_active_user

router = APIRouter()


def parse_github_url(url: str):
    """Parse GitHub URL and extract owner/repo"""
    patterns = [
        r'github\.com/([^\/]+)/([^\/\.]+)',
        r'github\.com/([^\/]+)/([^\/\.]+)\.git',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return {"owner": match.group(1), "repo": match.group(2)}
    
    return None


@router.post("/analyze", response_model=ApiResponse)
async def analyze_github_repo(
    url: str,
    candidate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not url or not candidate_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub URL and candidate ID are required"
        )
    
    parsed = parse_github_url(url)
    if not parsed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub URL format"
        )
    
    owner, repo = parsed["owner"], parsed["repo"]
    
    # Try to fetch repository data
    try:
        headers = {}
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not fetch repository data. Repository may be private or invalid."
                )
            
            repo_data = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching repository data: {str(e)}"
        )
    
    # Extract useful information
    languages = [repo_data.get("language")] if repo_data.get("language") else []
    description = repo_data.get("description", "")
    topics = repo_data.get("topics", [])
    size = repo_data.get("size", 0)
    stargazers = repo_data.get("stargazers_count", 0)
    forks = repo_data.get("forks_count", 0)
    updated_at = repo_data.get("updated_at", "")
    
    # Create evidence record
    evidence = Evidence(
        candidate_id=candidate_id,
        filename=f"{owner}/{repo}",
        source="GitHub API",
        evidence_type="Source Code",
        file_size=size,
        file_type="application/json",
        extraction_snippet=f"GitHub repository: {owner}/{repo}. Languages: {', '.join(languages)}. Stars: {stargazers}, Forks: {forks}",
        raw_content=str({
            "name": repo_data.get("full_name"),
            "description": description,
            "languages": languages,
            "topics": topics,
            "size": size,
            "stargazers": stargazers,
            "forks": forks,
            "updated_at": updated_at
        }),
        status="SUPPORTED",
        confidence_score=95
    )
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    # Update candidate's GitHub URL if not set
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate and not candidate.github_url:
        candidate.github_url = url
        db.commit()
    
    # Create verification event
    from app.models.verification import VerificationEvent
    verification_event = VerificationEvent(
        candidate_id=candidate_id,
        event_type="GitHub Evidence Retrieved",
        actor="GitHub Integration",
        details=f"Successfully analyzed repository {owner}/{repo} with {len(languages)} detected languages",
        source_ref=str(evidence.id)
    )
    db.add(verification_event)
    db.commit()
    
    return ApiResponse(
        success=True,
        data={
            "repository": {
                "name": repo_data.get("full_name"),
                "description": description,
                "languages": languages,
                "topics": topics,
                "size": size,
                "stargazers": stargazers,
                "forks": forks,
                "updated_at": updated_at
            },
            "evidence": {
                "id": str(evidence.id),
                "filename": evidence.filename,
                "source": evidence.source,
                "evidence_type": evidence.evidence_type,
                "status": evidence.status,
                "confidence_score": evidence.confidence_score
            }
        }
    )


@router.post("/validate", response_model=ApiResponse)
async def validate_github_url(
    url: str,
    current_user: User = Depends(get_current_active_user)
):
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub URL is required"
        )
    
    parsed = parse_github_url(url)
    if not parsed:
        return ApiResponse(
            success=False,
            data={"valid": False, "error": "Invalid GitHub URL format"}
        )
    
    # Try to validate by fetching repository info
    try:
        headers = {}
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{parsed['owner']}/{parsed['repo']}",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return ApiResponse(
                    success=True,
                    data={
                        "valid": True,
                        "data": {
                            "owner": parsed["owner"],
                            "repo": parsed["repo"]
                        }
                    }
                )
            else:
                return ApiResponse(
                    success=False,
                    data={"valid": False, "error": "Repository not found or not accessible"}
                )
    except Exception:
        return ApiResponse(
            success=False,
            data={"valid": False, "error": "Repository not found or not accessible"}
        )
