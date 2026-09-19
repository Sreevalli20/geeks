import { Router } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Generate candidate evidence report
router.post('/candidate/:candidateId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { candidateId } = req.params;

    // Get candidate data
    const candidateResult = await query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (candidateResult.rows.length === 0) {
      throw new ValidationError('Candidate not found');
    }

    const candidate = candidateResult.rows[0];

    // Get claims
    const claimsResult = await query(
      'SELECT * FROM claims WHERE candidate_id = $1',
      [candidateId]
    );

    // Get skills
    const skillsResult = await query(
      'SELECT * FROM skills WHERE candidate_id = $1',
      [candidateId]
    );

    // Get evidence
    const evidenceResult = await query(
      'SELECT * FROM evidence WHERE candidate_id = $1',
      [candidateId]
    );

    // Calculate statistics
    const supportedClaims = claimsResult.rows.filter((c: any) => c.evidence_status === 'Supported').length;
    const partiallySupportedClaims = claimsResult.rows.filter((c: any) => c.evidence_status === 'Partially Supported').length;
    const unverifiedClaims = claimsResult.rows.filter((c: any) => c.evidence_status === 'Unverified').length;
    const conflictingClaims = claimsResult.rows.filter((c: any) => c.evidence_status === 'Conflicting').length;

    const provenSkills = skillsResult.rows.filter((s: any) => s.is_proven).length;
    const totalSkills = skillsResult.rows.length;

    const sections = [
      {
        title: 'Candidate Overview',
        content: `${candidate.name} - ${candidate.detected_role}`,
        items: [`Email: ${candidate.email || 'Not provided'}`, `Location: ${candidate.location || 'Not provided'}`]
      },
      {
        title: 'Claims Analysis',
        content: `Total claims: ${claimsResult.rows.length}`,
        items: [
          `Supported: ${supportedClaims}`,
          `Partially Supported: ${partiallySupportedClaims}`,
          `Unverified: ${unverifiedClaims}`,
          `Conflicting: ${conflictingClaims}`
        ]
      },
      {
        title: 'Skills Verification',
        content: `Total skills: ${totalSkills}`,
        items: [
          `Proven skills: ${provenSkills}`,
          `Skills requiring evidence: ${totalSkills - provenSkills}`
        ]
      },
      {
        title: 'Evidence Summary',
        content: `Total evidence items: ${evidenceResult.rows.length}`,
        items: evidenceResult.rows.map((e: any) => `${e.evidence_type}: ${e.filename}`)
      }
    ];

    const reportResult = await query(
      `INSERT INTO reports (type, candidate_id, candidate_name, summary, sections)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        'Candidate Proof Report',
        candidateId,
        candidate.name,
        `Evidence report for ${candidate.name} with ${supportedClaims} supported claims and ${provenSkills} proven skills`,
        JSON.stringify(sections)
      ]
    );

    res.json({
      success: true,
      data: {
        report: reportResult.rows[0],
        statistics: {
          supportedClaims,
          partiallySupportedClaims,
          unverifiedClaims,
          conflictingClaims,
          provenSkills,
          totalSkills,
          totalEvidence: evidenceResult.rows.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get report by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Report not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as reportsRouter };
