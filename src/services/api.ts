import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const API_BASE = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = {
    ...options.headers as any,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if ((text.includes('<!doctype html>') || text.includes('<html')) && retryCount < 10) {
      const waitTime = Math.min(2000 + retryCount * 1000, 5000);
      console.log(`API warming up, retrying in ${waitTime}ms... (${retryCount + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithAuth(url, options, retryCount + 1);
    }
    
    if (text.includes('<!doctype html>') || text.includes('<html')) {
      throw new Error('Server is starting up. Please wait and refresh.');
    }
    throw new Error(`Technical error: ${res.statusText}`);
  }

  if (!res.ok) {
    throw new Error(data.details || data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const api = {
  async getTransactions(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'users', userId, 'transactions'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: d.data().date instanceof Timestamp ? d.data().date.toDate().toISOString() : d.data().date,
      })) as any[];
    } catch (err: any) {
      console.error("Firestore getTransactions error:", err);
      throw err;
    }
  },

  async createTransaction(data: any): Promise<any> {
    try {
      const { userId, ...txData } = data;
      const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), {
        ...txData,
        userId,
        date: txData.date || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...txData, userId } as any;
    } catch (err: any) {
      console.error("Firestore createTransaction error:", err);
      throw err;
    }
  },

  async getBudgets(userId: string, month?: string): Promise<any[]> {
    try {
      let q = query(collection(db, 'users', userId, 'budgets'));
      if (month) {
        q = query(q, where('month', '==', month));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as any[];
    } catch (err: any) {
      console.error("Firestore getBudgets error:", err);
      throw err;
    }
  },

  async createBudget(data: any): Promise<any> {
    try {
      const { userId, ...bgData } = data;
      const docRef = await addDoc(collection(db, 'users', userId, 'budgets'), {
        ...bgData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...bgData, userId } as any;
    } catch (err: any) {
      console.error("Firestore createBudget error:", err);
      throw err;
    }
  },

  async deleteBudget(id: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
      return { success: true };
    } catch (err: any) {
      console.error("Firestore deleteBudget error:", err);
      throw err;
    }
  },

  async analyzeSpending(transactions: any[]) {
    return fetchWithAuth(`${API_BASE}/ai/analyze-spending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });
  }
};
