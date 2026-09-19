import { Router } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get evidence for a candidate
router.get('/candidate/:candidateId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { candidateId } = req.params;
    const result = await query(
      'SELECT * FROM evidence WHERE candidate_id = $1 ORDER BY uploaded_at DESC',
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

// Get single evidence item
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM evidence WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Evidence not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create evidence
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      candidate_id,
      filename,
      source,
      evidence_type,
      file_size,
      file_type,
      storage_path,
      raw_content,
      extraction_snippet,
      status,
      confidence_score
    } = req.body;

    if (!candidate_id || !filename || !evidence_type) {
      throw new ValidationError('Missing required fields');
    }

    const result = await query(
      `INSERT INTO evidence (
        candidate_id, filename, source, evidence_type, file_size, file_type,
        storage_path, raw_content, extraction_snippet, status, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        candidate_id, filename, source || 'Direct Upload', evidence_type, file_size, file_type,
        storage_path, raw_content, extraction_snippet, status || 'EXTRACTED', confidence_score
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

// Update evidence
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      human_reviewed,
      reviewer_comment
    } = req.body;

    const result = await query(
      `UPDATE evidence SET
        status = COALESCE($1, status),
        human_reviewed = COALESCE($2, human_reviewed),
        reviewer_comment = COALESCE($3, reviewer_comment)
      WHERE id = $4
      RETURNING *`,
      [status, human_reviewed, reviewer_comment, id]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Evidence not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete evidence
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM evidence WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Evidence not found');
    }

    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export { router as evidenceRouter };
