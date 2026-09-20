from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create SQLAlchemy engine with appropriate adapter
if settings.DATABASE_URL.startswith("postgresql://"):
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=300
    )
else:
    # Use SQLite for local development/testing
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize database
def init_db():
    from app.models import user, candidate, claim, skill, evidence, challenge, assessment, report
    Base.metadata.create_all(bind=engine)
