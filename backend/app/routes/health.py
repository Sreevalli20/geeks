from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "success": True,
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "skillproof-api",
        "version": "1.0.0"
    }
