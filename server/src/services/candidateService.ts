import { query } from '../database/index.js';
import { parseCandidateFromText } from './resumeParser.js';

export async function createCandidateFromExtraction(
  extractedText: string,
  filename: string,
  existingCandidateId?: string
) {
  const parsed = parseCandidateFromText(extractedText, filename);

  let candidateId = existingCandidateId;

  if (existingCandidateId) {
    // Update existing candidate
    const result = await query(
      `UPDATE candidates SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        detected_role = COALESCE($4, detected_role),
        summary = COALESCE($5, summary),
        education_degree = COALESCE($6, education_degree),
        education_institution = COALESCE($7, education_institution),
        github_url = COALESCE($8, github_url),
        linkedin_url = COALESCE($9, linkedin_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        parsed.name || null,
        parsed.email || null,
        parsed.phone || null,
        parsed.detectedRole || null,
        parsed.summary || null,
        parsed.education_degree || null,
        parsed.education_institution || null,
        parsed.github_url || null,
        parsed.linkedin_url || null,
        existingCandidateId
      ]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  }

  // Create new candidate
  const result = await query(
    `INSERT INTO candidates (
      name, email, phone, detected_role, summary,
      education_degree, education_institution, github_url, linkedin_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      parsed.name || 'Candidate Requiring Review',
      parsed.email || '',
      parsed.phone || null,
      parsed.detectedRole || 'Software Engineer',
      parsed.summary || 'Extracted from uploaded resume',
      parsed.education_degree || null,
      parsed.education_institution || null,
      parsed.github_url || null,
      parsed.linkedin_url || null
    ]
  );

  const candidate = result.rows[0];
  candidateId = candidate.id;

  // Create skills from detected skills
  for (const skill of parsed.keySkills) {
    await query(
      `INSERT INTO skills (candidate_id, name, category, resume_claim_level)
      VALUES ($1, $2, $3, $4)`,
      [candidateId, skill, 'Language', 'Mentioned in Resume']
    );
  }

  // Create claims from detected skills
  for (const skill of parsed.keySkills) {
    await query(
      `INSERT INTO claims (candidate_id, title, claim_type, source, description)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        candidateId,
        skill,
        'Technical Skill',
        'Resume',
        `Candidate claimed proficiency in ${skill} based on resume analysis`
      ]
    );
  }

  return candidate;
}
