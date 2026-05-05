import express from 'express';
import { transactionController } from '../controllers/transactionController.ts';
import { authenticate } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { transactionSchema } from '../schemas/validation.ts';

const router = express.Router();

router.use(authenticate);

router.get('/', transactionController.getAll);
router.post('/', validate(transactionSchema), transactionController.create);

export default router;
