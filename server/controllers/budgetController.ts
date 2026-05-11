import type { Response } from 'express';
import admin, { db } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

export const budgetController = {
  async getAll(req: AuthRequest, res: Response) {
    const userId = req.user?.uid || req.query.userId as string;
    const month = req.query.month as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      let queryRef: any = db.collection('users').doc(userId).collection('budgets');
      if (month) {
        queryRef = queryRef.where('month', '==', month);
      }

      const snapshot = await queryRef.get();
      const budgets = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(budgets);
    } catch (error) {
      console.error('Error getting budgets:', error);
      res.status(500).json({ error: 'Failed to fetch budgets' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const budgetData = { 
        ...req.body, 
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('users').doc(userId).collection('budgets').add(budgetData);
      const newDoc = await docRef.get();

      res.status(201).json({
        id: newDoc.id,
        ...newDoc.data()
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(400).json({ error: 'Failed to create budget' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const docRef = db.collection('users').doc(userId).collection('budgets').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Budget not found or unauthorized' });
      }

      await docRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting budget:', error);
      res.status(500).json({ error: 'Failed to delete budget' });
    }
  }
};
