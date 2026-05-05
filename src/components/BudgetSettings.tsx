import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { api } from '@/src/services/api';
import { cn, formatCurrency } from '@/src/lib/utils';

export default function BudgetSettings() {
  const { user, budgets, setBudgets } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    category: 'Food',
    amount: '',
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newBudget = await api.createBudget({
        userId: user.uid,
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: currentMonth,
      });
      setBudgets([...budgets, newBudget]);
      setIsModalOpen(false);
      setFormData({ category: 'Food', amount: '' });
    } catch (err) {
      console.error("Error adding budget:", err);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    try {
      await api.deleteBudget(id);
      setBudgets(budgets.filter((b: any) => b._id !== id && b.id !== id));
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-light tracking-tighter"
          >
            Budgets
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2 font-medium"
          >
            Set targets to optimize your saving capacity.
          </motion.p>
        </div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all group"
        >
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Budget</span>
        </motion.button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {budgets.length === 0 ? (
          <div className="p-20 text-center bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border shadow-inner">
            <Settings size={48} className="mx-auto text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Passive Planning</h3>
            <p className="text-sm font-medium opacity-60">You haven't defined any spending thresholds yet.</p>
          </div>
        ) : (
          budgets.map((budget: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={budget._id || budget.id}
              className="bg-card border border-border p-8 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-secondary rounded-[1.25rem] flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">{budget.category}</h4>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">{budget.month}</p>
                </div>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mb-1 opacity-60">Cap Limit</p>
                  <p className="text-3xl font-light tracking-tighter">{formatCurrency(budget.amount)}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBudget(budget._id || budget.id)}
                  className="p-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl text-primary" />
              
              <div className="relative z-10">
                <h2 className="text-4xl font-light tracking-tighter mb-2">Set Target</h2>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-10">Define your monthly strategy</p>
                
                <form onSubmit={handleAddBudget} className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-5 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold text-sm"
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

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Monthly Threshold (TND)</label>
                    <input 
                      required
                      type="number" 
                      step="0.001"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.000"
                      className="w-full p-6 bg-secondary/50 border border-border rounded-3xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-4xl font-light tracking-tighter text-foreground placeholder:opacity-20"
                    />
                  </div>

                  <div className="flex items-center gap-6 mt-12">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all ml-4"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all uppercase tracking-widest text-[11px]"
                    >
                      Authorize Strategy
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
