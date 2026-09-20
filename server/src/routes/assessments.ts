import { Router, Response, NextFunction } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get assessments for a candidate
router.get('/candidate/:candidateId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const result = await query(
      'SELECT * FROM assessments WHERE candidate_id = $1 ORDER BY date DESC',
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

// Create assessment
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      candidate_id,
      title,
      category,
      score_explainable,
      score,
      verified_skills
    } = req.body;

    if (!candidate_id || !title || !category || !score_explainable) {
      throw new ValidationError('Missing required fields');
    }

    const result = await query(
      `INSERT INTO assessments (
        candidate_id, title, category, score_explainable, score, verified_skills, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        candidate_id,
        title,
        category,
        score_explainable,
        score,
        verified_skills || [],
        'Completed'
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as assessmentsRouter };
