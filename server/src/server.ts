import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';
import { candidatesRouter } from './routes/candidates.js';
import { claimsRouter } from './routes/claims.js';
import { skillsRouter } from './routes/skills.js';
import { evidenceRouter } from './routes/evidence.js';
import { uploadsRouter } from './routes/uploads.js';
import { challengesRouter } from './routes/challenges.js';
import { githubRouter } from './routes/github.js';
import { authRouter } from './routes/auth.js';
import { assessmentsRouter } from './routes/assessments.js';
import { reportsRouter } from './routes/reports.js';
import { verificationRouter } from './routes/verification.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/github', githubRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/verification', verificationRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`SkillProof server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
