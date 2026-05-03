import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { cn, formatCurrency } from '@/src/lib/utils';

export default function BudgetSettings() {
  const { user, budgets, setBudgets } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    category: 'Food',
    amount: '',
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'budgets'),
      where('month', '==', currentMonth)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setBudgets(data);
    });

    return () => unsubscribe();
  }, [user, setBudgets, currentMonth]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'budgets'), {
        userId: user.uid,
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: currentMonth,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormData({ category: 'Food', amount: '' });
    } catch (err) {
      console.error("Error adding budget:", err);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Budgets</h1>
          <p className="text-slate-500 mt-1">Configurez vos limites de dépenses mensuelles</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/25"
        >
          <Plus size={20} strokeWidth={3} />
          <span>New Budget</span>
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {budgets.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <Settings size={48} className="mx-auto text-slate-700 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-slate-400">Aucun budget défini</h3>
            <p className="text-slate-600 mt-2">Commencez par définir une limite pour une catégorie de dépense.</p>
          </div>
        ) : (
          budgets.map((budget) => (
            <motion.div 
              layout
              key={budget.id}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{budget.category}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{budget.month}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Limit</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(budget.amount)}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Set Category Budget</h2>
            <form onSubmit={handleAddBudget} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 bg-black border border-slate-800 rounded-xl focus:border-primary outline-none appearance-none text-white"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Bills</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                  <option>Health</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Monthly Limit (TND)</label>
                <input 
                  required
                  type="number" 
                  step="0.001"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.000"
                  className="w-full p-4 bg-black border border-slate-800 rounded-xl focus:border-primary outline-none transition-all text-xl font-bold text-white"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-white transition-all underline underline-offset-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-black font-black rounded-xl hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
