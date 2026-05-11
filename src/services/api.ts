import { auth } from '../lib/firebase';

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
  async getTransactions(userId: string) {
    return fetchWithAuth(`${API_BASE}/transactions?userId=${userId}`);
  },

  async createTransaction(data: any) {
    return fetchWithAuth(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getBudgets(userId: string, month?: string) {
    let url = `${API_BASE}/budgets?userId=${userId}`;
    if (month) url += `&month=${month}`;
    return fetchWithAuth(url);
  },

  async createBudget(data: any) {
    return fetchWithAuth(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteBudget(id: string) {
    return fetchWithAuth(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
    });
  },

  async analyzeSpending(transactions: any[]) {
    return fetchWithAuth(`${API_BASE}/ai/analyze-spending`, {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }
};
