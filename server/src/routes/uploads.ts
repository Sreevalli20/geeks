import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { extractResumeText } from '../services/resumeParser.js';
import { createCandidateFromExtraction } from '../services/candidateService.js';

const router = Router();

// Configure multer for file uploads (using memory storage for now)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt|md|png|jpg|jpeg|zip)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload resume and create candidate
router.post('/resume', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const file = req.file;
    const { candidate_id } = req.body;

    // Extract text from resume
    const extractedText = await extractResumeText(file);

    // Create or update candidate from extraction
    const candidate = await createCandidateFromExtraction(extractedText, file.originalname, candidate_id);

    // Store resume record
    const resumeResult = await query(
      `INSERT INTO resumes (
        candidate_id, filename, file_size, file_type, raw_text, parse_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [candidate.id, file.originalname, file.size, file.mimetype, extractedText, 'Extracted']
    );

    // Create evidence record
    const evidenceResult = await query(
      `INSERT INTO evidence (
        candidate_id, filename, source, evidence_type, file_size, file_type,
        raw_content, extraction_snippet, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        candidate.id,
        file.originalname,
        'Resume Upload',
        'Resume',
        file.size,
        file.mimetype,
        extractedText.substring(0, 5000),
        `Resume processed: ${candidate.name} with ${candidate.keySkills?.length || 0} detected skills`,
        'EXTRACTED'
      ]
    );

    // Create verification event
    await query(
      `INSERT INTO verification_events (candidate_id, event_type, actor, details, source_ref)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        candidate.id,
        'Resume Uploaded',
        'Upload Center',
        `Resume ${file.originalname} uploaded and processed successfully`,
        resumeResult.rows[0].id
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        candidate,
        resume: resumeResult.rows[0],
        evidence: evidenceResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload supporting evidence
router.post('/evidence', authenticate, upload.array('files', 10), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ValidationError('No files uploaded');
    }

    const { candidate_id } = req.body;
    if (!candidate_id) {
      throw new ValidationError('Candidate ID is required');
    }

    const evidenceRecords = [];

    for (const file of req.files as Express.Multer.File[]) {
      const fileContent = file.buffer.toString('utf-8');
      const snippet = fileContent.substring(0, 220);

      const result = await query(
        `INSERT INTO evidence (
          candidate_id, filename, source, evidence_type, file_size, file_type,
          raw_content, extraction_snippet, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          candidate_id,
          file.originalname,
          'Evidence Upload',
          'Other',
          file.size,
          file.mimetype,
          fileContent,
          snippet,
          'EXTRACTED'
        ]
      );

      evidenceRecords.push(result.rows[0]);
    }

    // Create verification event
    await query(
      `INSERT INTO verification_events (candidate_id, event_type, actor, details)
      VALUES ($1, $2, $3, $4)`,
      [
        candidate_id,
        'Evidence Uploaded',
        'Upload Center',
        `${evidenceRecords.length} evidence files uploaded successfully`
      ]
    );

    res.status(201).json({
      success: true,
      data: evidenceRecords
    });
  } catch (error) {
    next(error);
  }
});

export { router as uploadsRouter };
