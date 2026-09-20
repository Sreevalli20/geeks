import { Router, Response, NextFunction } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get claims for a candidate
router.get('/candidate/:candidateId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const result = await query(
      'SELECT * FROM claims WHERE candidate_id = $1 ORDER BY created_at DESC',
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

// Get single claim
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM claims WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Claim not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create claim
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      candidate_id,
      title,
      claim_type,
      source,
      description,
      declared_level
    } = req.body;

    if (!candidate_id || !title || !claim_type || !source) {
      throw new ValidationError('Missing required fields');
    }

    const result = await query(
      `INSERT INTO claims (candidate_id, title, claim_type, source, description, declared_level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [candidate_id, title, claim_type, source, description, declared_level]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update claim
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      evidence_status,
      reviewed_by_human,
      reviewer_notes
    } = req.body;

    const result = await query(
      `UPDATE claims SET
        evidence_status = COALESCE($1, evidence_status),
        reviewed_by_human = COALESCE($2, reviewed_by_human),
        reviewer_notes = COALESCE($3, reviewer_notes),
        reviewed_at = CASE WHEN $2 = true THEN CURRENT_TIMESTAMP ELSE reviewed_at END
      WHERE id = $4
      RETURNING *`,
      [evidence_status, reviewed_by_human, reviewer_notes, id]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Claim not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as claimsRouter };
