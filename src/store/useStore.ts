import { create } from 'zustand';
import { User } from 'firebase/auth';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
