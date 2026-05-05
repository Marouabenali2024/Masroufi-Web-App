import type { Response } from 'express';
import { Budget } from '../../src/lib/db.ts';
import type { AuthRequest } from '../middleware/auth.ts';

export const budgetController = {
  async getAll(req: AuthRequest, res: Response) {
    const userId = req.user?.uid || req.query.userId as string;
    const month = req.query.month as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const query: any = { userId };
    if (month) query.month = month;

    const budgets = await Budget.find(query);
    res.json(budgets);
  },

  async create(req: AuthRequest, res: Response) {
    const userId = req.user?.uid;
    const budgetData = { ...req.body, userId };

    const budget = new Budget(budgetData);
    await budget.save();
    res.status(201).json(budget);
  },

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.uid;

    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found or unauthorized' });
    }

    res.json({ success: true });
  }
};
