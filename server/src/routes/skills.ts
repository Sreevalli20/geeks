import { Router } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get skills for a candidate
router.get('/candidate/:candidateId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { candidateId } = req.params;
    const result = await query(
      'SELECT * FROM skills WHERE candidate_id = $1 ORDER BY created_at DESC',
      [candidateId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get single skill
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM skills WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Skill not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create skill
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      candidate_id,
      name,
      category,
      resume_claim_level
    } = req.body;

    if (!candidate_id || !name || !category) {
      throw new ValidationError('Missing required fields');
    }

    const result = await query(
      `INSERT INTO skills (candidate_id, name, category, resume_claim_level)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [candidate_id, name, category, resume_claim_level]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update skill
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const {
      evidence_count,
      verification_state,
      evidence_strength,
      missing_proof_reason,
      recommended_validation,
      is_proven
    } = req.body;

    const result = await query(
      `UPDATE skills SET
        evidence_count = COALESCE($1, evidence_count),
        verification_state = COALESCE($2, verification_state),
        evidence_strength = COALESCE($3, evidence_strength),
        missing_proof_reason = COALESCE($4, missing_proof_reason),
        recommended_validation = COALESCE($5, recommended_validation),
        is_proven = COALESCE($6, is_proven),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [evidence_count, verification_state, evidence_strength, missing_proof_reason, recommended_validation, is_proven, id]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Skill not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as skillsRouter };
