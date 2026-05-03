import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { useStore } from '@/src/store/useStore';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

// Statistics Card Component
const StatCard = ({ title, amount, type, icon: Icon }: { title: string, amount: number, type: 'income' | 'expense' | 'balance', icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between min-h-[160px] rounded-2xl"
  >
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-semibold">{title}</p>
      <h2 className={cn(
        "text-3xl font-bold tracking-tight",
        type === 'income' ? "text-primary" : 
        type === 'expense' ? "text-rose-400" : 
        "text-white"
      )}>
        {formatCurrency(amount).replace('TND', '')} <span className="text-sm text-slate-500 font-medium">TND</span>
      </h2>
    </div>
    
    <div className="mt-4 flex items-center justify-between">
      <div className={cn(
        "flex items-center text-xs font-bold",
        type === 'income' || type === 'balance' ? "text-primary" : "text-rose-400"
      )}>
        {type === 'income' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        <span>{type === 'balance' ? '+12.5%' : 'Updated'}</span>
      </div>
      <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
        <Icon size={18} />
      </div>
    </div>
  </motion.div>
);

// AI Insight Component
const AIInsight = ({ budgetUsage }: { budgetUsage: any[] }) => {
  const exceeded = budgetUsage.find(b => b.spent > b.amount);
  const nearing = budgetUsage.find(b => b.spent > b.amount * 0.8 && b.spent <= b.amount);

  let message = "Keep tracking your expenses to get personalized insights!";
  if (exceeded) {
    message = `Attention : Vous avez dépassé votre budget pour "${exceeded.category}". Pensez à limiter vos dépenses dans cette catégorie.`;
  } else if (nearing) {
    message = `Conseil : Vous approchez de la limite de votre budget "${nearing.category}". Il vous reste peu de marge pour ce mois.`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="ai-card p-6 flex gap-4 items-start"
    >
      <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0">
        <Sparkles size={24} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-1">AI Financial Insight</h3>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "{message}"
        </p>
      </div>
    </motion.div>
  );
};

// Add Transaction Modal
const AddTransaction = ({ onClose }: { onClose: () => void }) => {
  const { user } = useStore();
  const [formData, setFormData] = React.useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        userId: user.uid
      });
      onClose();
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">New Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={cn(
                  "py-2 rounded-lg text-sm font-bold transition-all",
                  formData.type === t ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Amount (TND)</label>
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
              <option>Salary</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Description</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What was this for?"
              className="w-full p-4 bg-black border border-slate-800 rounded-xl focus:border-primary outline-none text-white"
            />
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-400 hover:text-white transition-all underline underline-offset-4"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-primary text-black font-black rounded-xl hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Dashboard() {
  const { user, transactions, setTransactions, budgets, setBudgets } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  React.useEffect(() => {
    if (!user) return;

    // Fetch Transactions
    const qTx = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribeTx = onSnapshot(qTx, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTransactions(data);
    });

    // Fetch Budgets
    const qBg = query(
      collection(db, 'users', user.uid, 'budgets'),
      where('month', '==', currentMonth)
    );

    const unsubscribeBg = onSnapshot(qBg, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setBudgets(data);
    });

    return () => {
      unsubscribeTx();
      unsubscribeBg();
    };
  }, [user, setTransactions, setBudgets, currentMonth]);

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += curr.amount;
    else acc.expense += curr.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  const budgetUsage = budgets.map(budget => {
    const spent = transactions
      .filter(tx => tx.category === budget.category && tx.type === 'expense' && tx.date.startsWith(budget.month))
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...budget, spent };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className="text-slate-500 mt-1">Gérer votre Masroufi intelligemment</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Transaction</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Current Balance" amount={balance} type="balance" icon={Wallet} />
        <StatCard title="Total Income" amount={totals.income} type="income" icon={TrendingUp} />
        <StatCard title="Total Expenses" amount={totals.expense} type="expense" icon={TrendingDown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <button className="text-primary text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                  <p className="text-slate-500 font-medium">No transactions yet. Start by adding one!</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <motion.div 
                    layout
                    key={tx.id}
                    className="bg-slate-900/50 border border-slate-800 hover:border-primary/30 p-4 flex items-center justify-between group transition-all rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        tx.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">{tx.category}</p>
                        <p className="text-xs text-slate-500 mt-1">{tx.description || tx.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        tx.type === 'income' ? "text-primary" : "text-rose-400"
                      )}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Masroufi Intelligence</h2>
            <AIInsight budgetUsage={budgetUsage} />
          </section>
          
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Budget Tracking</h3>
            {budgetUsage.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No budgets set for this month. Go to settings to set your goals.</p>
            ) : (
              <div className="space-y-6">
                {budgetUsage.map((b) => {
                  const percent = Math.min((b.spent / b.amount) * 100, 100);
                  const isExceeded = b.spent > b.amount;
                  const isNearing = !isExceeded && percent > 80;

                  return (
                    <div key={b.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-bold text-white text-sm">{b.category}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                          isExceeded ? "bg-rose-500/20 text-rose-400" : 
                          isNearing ? "bg-orange-500/20 text-orange-400" : 
                          "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {isExceeded ? 'Exceeded' : isNearing ? 'Nearing' : 'Good'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={cn(
                            "h-full transition-all duration-1000",
                            isExceeded ? "bg-rose-500" : isNearing ? "bg-orange-500" : "bg-primary"
                          )} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex items-center gap-3 text-slate-400">
                 <AlertCircle size={14} className="text-primary" />
                 <p className="text-[10px] font-medium leading-relaxed italic">
                   "You are doing well with your {budgetUsage[0]?.category || 'spending'} budget. Stay disciplined!"
                 </p>
               </div>
            </div>
          </section>
        </div>
      </div>

      {isAddModalOpen && <AddTransaction onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
