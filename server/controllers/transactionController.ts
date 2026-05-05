import type { Response } from 'express';
import { Transaction } from '../../src/lib/db.ts';
import type { AuthRequest } from '../middleware/auth.ts';

export const transactionController = {
  async getAll(req: AuthRequest, res: Response) {
    const userId = req.user?.uid || req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  },

  async create(req: AuthRequest, res: Response) {
    const userId = req.user?.uid;
    const transactionData = { ...req.body, userId };
    
    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).json(transaction);
  }
};
