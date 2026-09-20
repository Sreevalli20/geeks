"""
Database migration script for SkillProof Python backend
Creates all required tables for the application
"""
from app.database import init_db, engine
from app.models import user, candidate, claim, skill, evidence, challenge, assessment, report, resume, verification


def run_migration():
    """Run database migration to create all tables"""
    print("Starting database migration...")
    
    try:
        # Initialize database and create all tables
        init_db()
        print("✓ Database migration completed successfully")
        print("✓ All tables created")
        
        # Create indexes for better performance
        from sqlalchemy import text
        
        with engine.connect() as conn:
            print("Creating indexes...")
            
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email)",
                "CREATE INDEX IF NOT EXISTS idx_claims_candidate_id ON claims(candidate_id)",
                "CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON skills(candidate_id)",
                "CREATE INDEX IF NOT EXISTS idx_evidence_candidate_id ON evidence(candidate_id)",
                "CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status)",
                "CREATE INDEX IF NOT EXISTS idx_verification_events_candidate_id ON verification_events(candidate_id)",
            ]
            
            for index_sql in indexes:
                conn.execute(text(index_sql))
            
            conn.commit()
            print("✓ All indexes created")
        
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise


if __name__ == "__main__":
    run_migration()
