import express from 'express';
import { budgetController } from '../controllers/budgetController.ts';
import { authenticate } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { budgetSchema } from '../schemas/validation.ts';

const router = express.Router();

router.use(authenticate);

router.get('/', budgetController.getAll);
router.post('/', validate(budgetSchema), budgetController.create);
router.delete('/:id', budgetController.delete);

export default router;
