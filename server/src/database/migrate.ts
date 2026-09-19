import { query } from './index.js';

const createTables = async () => {
  try {
    // Users table for authentication
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('CANDIDATE', 'RECRUITER', 'ADMIN')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Candidates table
    await query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        location VARCHAR(255),
        detected_role VARCHAR(255),
        target_role VARCHAR(255),
        summary TEXT,
        education_degree VARCHAR(255),
        education_institution VARCHAR(255),
        education_graduation_year VARCHAR(10),
        github_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        portfolio_url VARCHAR(500),
        is_development_data BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Resumes table
    await query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        file_type VARCHAR(100),
        storage_path VARCHAR(500),
        raw_text TEXT,
        parse_status VARCHAR(50) DEFAULT 'Processing',
        extracted_skills_count INTEGER DEFAULT 0,
        extracted_projects_count INTEGER DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Claims table
    await query(`
      CREATE TABLE IF NOT EXISTS claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        claim_type VARCHAR(100) NOT NULL,
        source VARCHAR(100) NOT NULL,
        description TEXT,
        declared_level VARCHAR(50),
        evidence_status VARCHAR(100) DEFAULT 'Unverified',
        reviewed_by_human BOOLEAN DEFAULT FALSE,
        reviewer_notes TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Skills table
    await query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        resume_claim_level VARCHAR(100),
        evidence_count INTEGER DEFAULT 0,
        verification_state VARCHAR(100) DEFAULT 'Not Yet Verified',
        evidence_strength VARCHAR(100) DEFAULT 'None',
        missing_proof_reason TEXT,
        recommended_validation TEXT,
        is_proven BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(100),
        role VARCHAR(255),
        claimed_skills TEXT[],
        verification_status VARCHAR(100) DEFAULT 'Unverified',
        repo_url VARCHAR(500),
        demo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Experience table
    await query(`
      CREATE TABLE IF NOT EXISTS experience (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        period VARCHAR(100) NOT NULL,
        description TEXT,
        claimed_skills TEXT[],
        verified_skills TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificates table
    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        issue_date DATE,
        credential_url VARCHAR(500),
        credential_id VARCHAR(255),
        evidence_id UUID,
        verification_status VARCHAR(100) DEFAULT 'Unverified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Evidence table
    await query(`
      CREATE TABLE IF NOT EXISTS evidence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        source VARCHAR(255) NOT NULL,
        evidence_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        file_type VARCHAR(100),
        storage_path VARCHAR(500),
        raw_content TEXT,
        extraction_snippet TEXT,
        status VARCHAR(100) DEFAULT 'EXTRACTED',
        conflicts TEXT,
        missing_information TEXT,
        human_reviewed BOOLEAN DEFAULT FALSE,
        reviewer_comment TEXT,
        confidence_score INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Evidence relationships table
    await query(`
      CREATE TABLE IF NOT EXISTS evidence_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID NOT NULL,
        source_type VARCHAR(100) NOT NULL,
        source_label VARCHAR(255) NOT NULL,
        target_id UUID NOT NULL,
        target_type VARCHAR(100) NOT NULL,
        target_label VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        confidence INTEGER NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Practical challenges table
    await query(`
      CREATE TABLE IF NOT EXISTS practical_challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        skill_tested VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        why_recommended TEXT,
        prompt_text TEXT NOT NULL,
        description TEXT,
        category VARCHAR(100),
        instructions TEXT[],
        starter_code TEXT,
        expected_output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Challenge submissions table
    await query(`
      CREATE TABLE IF NOT EXISTS challenge_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        challenge_id UUID REFERENCES practical_challenges(id) ON DELETE CASCADE,
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        submission_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        filename VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        evaluation_evidence TEXT,
        result VARCHAR(100) NOT NULL,
        proven_skills TEXT[],
        score_percentage INTEGER NOT NULL,
        total_score INTEGER,
        explainable_breakdown TEXT[]
      )
    `);

    // Assessments table
    await query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        score_explainable TEXT NOT NULL,
        score INTEGER,
        rubric_breakdown JSONB,
        verified_skills TEXT[],
        status VARCHAR(100) DEFAULT 'Pending',
        evidence_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verification events table
    await query(`
      CREATE TABLE IF NOT EXISTS verification_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        event_type VARCHAR(100) NOT NULL,
        actor VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        action VARCHAR(255),
        source_ref VARCHAR(255)
      )
    `);

    // Import jobs table
    await query(`
      CREATE TABLE IF NOT EXISTS import_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        records_detected INTEGER DEFAULT 0,
        valid_records INTEGER DEFAULT 0,
        invalid_records INTEGER DEFAULT 0,
        duplicates INTEGER DEFAULT 0,
        fields_detected TEXT[],
        status VARCHAR(100) DEFAULT 'Validated',
        errors TEXT[]
      )
    `);

    // Reports table
    await query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(100) NOT NULL,
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        candidate_name VARCHAR(255) NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT NOT NULL,
        sections JSONB NOT NULL
      )
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_claims_candidate_id ON claims(candidate_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON skills(candidate_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_evidence_candidate_id ON evidence(candidate_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_verification_events_candidate_id ON verification_events(candidate_id)`);

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { createTables };
