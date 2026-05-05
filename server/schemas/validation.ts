import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  userId: z.string().min(1), // In a real app, we'd compare this with the auth token
});

export const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  userId: z.string().min(1),
});
