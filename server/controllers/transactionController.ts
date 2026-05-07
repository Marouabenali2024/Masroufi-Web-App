import type { Response } from 'express';
import admin from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const db = admin.firestore();

export const transactionController = {
  async getAll(req: AuthRequest, res: Response) {
    const userId = req.user?.uid || req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const snapshot = await db.collection('users').doc(userId).collection('transactions')
        .orderBy('date', 'desc')
        .get();
      
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const transactionData = { 
        ...req.body, 
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('users').doc(userId).collection('transactions').add(transactionData);
      const newDoc = await docRef.get();
      
      res.status(201).json({
        id: newDoc.id,
        ...newDoc.data()
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(400).json({ error: 'Failed to create transaction' });
    }
  }
};
