from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.routes import health, auth, candidates, claims, skills, evidence, challenges, github, assessments, reports, uploads


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
    yield
    # Cleanup on shutdown if needed


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="SkillProof API - Don't Hire the Resume. Hire the Proof.",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.FRONTEND_URL else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(skills.router, prefix="/api/skills", tags=["Skills"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["Evidence"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(github.router, prefix="/api/github", tags=["GitHub"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])


@app.get("/")
async def root():
    return {
        "message": "SkillProof API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
