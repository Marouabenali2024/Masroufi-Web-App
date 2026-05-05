import express from 'express';
import { aiController } from '../controllers/aiController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticate);
router.post('/analyze-spending', aiController.analyzeSpending);

export default router;
