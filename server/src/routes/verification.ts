import { Router } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get verification timeline for a candidate
router.get('/timeline/:candidateId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { candidateId } = req.params;
    const result = await query(
      'SELECT * FROM verification_events WHERE candidate_id = $1 ORDER BY timestamp DESC',
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

// Create verification event
router.post('/event', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      candidate_id,
      event_type,
      actor,
      details,
      action,
      source_ref
    } = req.body;

    if (!candidate_id || !event_type || !actor || !details) {
      throw new ValidationError('Missing required fields');
    }

    const result = await query(
      `INSERT INTO verification_events (candidate_id, event_type, actor, details, action, source_ref)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [candidate_id, event_type, actor, details, action, source_ref]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as verificationRouter };
