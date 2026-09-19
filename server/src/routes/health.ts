import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SkillProof API',
    version: '1.0.0'
  });
});

export { router as healthRouter };
