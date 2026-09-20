import { Router, Response, NextFunction } from 'express';
import { query } from '../database/index.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get all candidates
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT * FROM candidates ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get single candidate
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM candidates WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Candidate not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create candidate
router.post('/', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      detected_role,
      target_role,
      summary,
      education_degree,
      education_institution,
      education_graduation_year,
      github_url,
      linkedin_url,
      portfolio_url
    } = req.body;

    if (!name) {
      throw new ValidationError('Name is required');
    }

    const result = await query(
      `INSERT INTO candidates (
        name, email, phone, location, detected_role, target_role, summary,
        education_degree, education_institution, education_graduation_year,
        github_url, linkedin_url, portfolio_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        name, email, phone, location, detected_role, target_role, summary,
        education_degree, education_institution, education_graduation_year,
        github_url, linkedin_url, portfolio_url
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

// Update candidate
router.put('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      location,
      detected_role,
      target_role,
      summary,
      education_degree,
      education_institution,
      education_graduation_year,
      github_url,
      linkedin_url,
      portfolio_url
    } = req.body;

    const result = await query(
      `UPDATE candidates SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        location = COALESCE($4, location),
        detected_role = COALESCE($5, detected_role),
        target_role = COALESCE($6, target_role),
        summary = COALESCE($7, summary),
        education_degree = COALESCE($8, education_degree),
        education_institution = COALESCE($9, education_institution),
        education_graduation_year = COALESCE($10, education_graduation_year),
        github_url = COALESCE($11, github_url),
        linkedin_url = COALESCE($12, linkedin_url),
        portfolio_url = COALESCE($13, portfolio_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [
        name, email, phone, location, detected_role, target_role, summary,
        education_degree, education_institution, education_graduation_year,
        github_url, linkedin_url, portfolio_url, id
      ]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Candidate not found');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete candidate
router.delete('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new ValidationError('Candidate not found');
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export { router as candidatesRouter };
