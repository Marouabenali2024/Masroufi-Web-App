import type { Response } from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import type { AuthRequest } from '../middleware/auth.ts';

export const aiController = {
  async analyzeSpending(req: AuthRequest, res: Response) {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.json({ tips: ["Start adding transactions to get personalized AI financial tips!"] });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Analyze the following monthly transaction history for a personal finance app named 'Masroufi'.
        The user is in Tunisia, so amounts are in TND (Tunisian Dinars).
        
        Transactions:
        ${JSON.stringify(transactions.slice(0, 50))} 
        
        Based on this data, provide exactly 3 personalized, actionable financial tips for the user.
        Make them specific, e.g., 'You spent X% more on dining out this month, try to cook at home to save Y TND'.
        Focus on identifying trends or categories where spending is high.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 3 personalized financial tips"
              }
            },
            required: ["tips"]
          }
        }
      });

      const responseText = result.text;
      const parsed = JSON.parse(responseText || '{"tips": []}');
      
      res.json(parsed);
    } catch (err) {
      console.error("AI Analysis error:", err);
      res.status(500).json({ 
        error: "Failed to generate AI insights", 
        details: err instanceof Error ? err.message : String(err) 
      });
    }
  }
};
