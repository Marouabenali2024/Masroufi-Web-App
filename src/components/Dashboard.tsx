import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { useStore } from '@/src/store/useStore';
import { api } from '@/src/services/api';

// Statistics Card Component
const StatCard = ({ title, amount, type, icon: Icon, trend }: { title: string, amount: number, type: 'income' | 'expense' | 'balance', icon: any, trend?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="bg-card border border-border p-6 flex flex-col justify-between min-h-[160px] rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2 font-bold">{title}</p>
        <h2 className={cn(
          "text-4xl font-light tracking-tighter",
          type === 'income' ? "text-primary" : 
          type === 'expense' ? "text-destructive" : 
          "text-foreground"
        )}>
          {formatCurrency(amount).replace('TND', '')}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">TND Total</p>
      </div>
      <div className="p-3 bg-secondary rounded-2xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
        <Icon size={20} />
      </div>
    </div>
    
    <div className="mt-6 flex items-center gap-2">
      <div className={cn(
        "flex items-center text-[10px] font-black uppercase px-2 py-1 rounded-full",
        type === 'income' || (type === 'balance' && amount >= 0) ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
      )}>
        {type === 'income' || amount >= 0 ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
        <span>{trend || 'Real-time'}</span>
      </div>
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Active Wallet</p>
    </div>
  </motion.div>
);

// AI Insight Component
const AIInsight = ({ budgetUsage, transactions }: { budgetUsage: any[], transactions: any[] }) => {
  const { user } = useStore();
  const [tips, setTips] = React.useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const exceeded = budgetUsage.find(b => b.spent > b.amount);
  const nearing = budgetUsage.find(b => b.spent > b.amount * 0.8 && b.spent <= b.amount);

  const getAiTips = async () => {
    if (!user || transactions.length === 0) return;
    setIsAnalyzing(true);
    try {
      const data = await api.analyzeSpending(transactions);
      if (data.tips && data.tips.length > 0) {
        setTips(data.tips);
      }
    } catch (err) {
      console.error("Failed to get AI tips:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    // Only auto-fetch if no tips yet and we have data
    if (tips.length === 0 && transactions.length > 0) {
      getAiTips();
    }
  }, [user, transactions.length]);

  let staticMessage = "Keep tracking your expenses to get personalized insights!";
  if (exceeded) {
    staticMessage = `Attention: You exceeded the "${exceeded.category}" budget. Consider reducing spend there.`;
  } else if (nearing) {
    staticMessage = `Tip: You're nearing the limit for "${nearing.category}". Just ${formatCurrency(nearing.amount - nearing.spent)} left.`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="ai-card p-6 flex flex-col gap-4 relative overflow-hidden group min-h-[160px]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0">
            <Sparkles size={18} className={cn(isAnalyzing && "animate-pulse")} />
          </div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Financial Intelligence</h3>
        </div>
        <button 
          onClick={getAiTips} 
          disabled={isAnalyzing}
          className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      <div className="relative z-10 space-y-3">
        {tips.length > 0 ? (
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-xs font-medium leading-relaxed border-l-2 border-primary/30 pl-3 py-0.5"
              >
                {tip}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-medium leading-relaxed italic opacity-90">
            "{isAnalyzing ? "Our AI is processing your financial pattern..." : staticMessage}"
          </p>
        )}
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
      const newTx = await api.createTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        userId: user.uid
      });
      const { transactions, setTransactions } = useStore.getState();
      setTransactions([newTx, ...transactions]);
      onClose();
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border border-border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-4xl font-light tracking-tighter mb-2">New Entry</h2>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-8">Record a new financial flow</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary rounded-2xl">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={cn(
                    "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    formData.type === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Value (TND)</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold text-sm"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Bills</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                  <option>Salary</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Note</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Memo..."
                  className="w-full p-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium placeholder:italic"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <button 
                type="button" 
                onClick={onClose}
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all ml-4"
              >
                Dismiss
              </button>
              <button 
                type="submit"
                className="flex-1 py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all uppercase tracking-widest text-[11px]"
              >
                Validate Transaction
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default function Dashboard() {
  const { user, transactions, setTransactions, budgets, setBudgets } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

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
    <div className="max-w-7xl mx-auto py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-light tracking-tighter"
          >
            Dashboard
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="text-muted-foreground mt-2 font-medium"
          >
            Manage your finances with precision.
          </motion.p>
        </div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all group"
        >
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Transaction</span>
        </motion.button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Liquidity" amount={balance} type="balance" icon={Wallet} trend="+2.4% vs last mo" />
        <StatCard title="Inflow" amount={totals.income} type="income" icon={TrendingUp} trend="Active revenue" />
        <StatCard title="Outflow" amount={totals.expense} type="expense" icon={TrendingDown} trend="Controlled spend" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
              <button className="text-primary text-xs font-black uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all pb-1">View Archives</button>
            </div>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border">
                  <p className="text-muted-foreground font-bold opacity-50 uppercase tracking-widest text-[10px]">No activity detected</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {transactions.slice(0, 5).map((tx: any, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      key={tx._id || tx.id}
                      className="bg-card border border-border hover:border-primary/20 p-5 flex items-center justify-between group transition-all rounded-3xl shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                          tx.type === 'income' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}>
                          {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-bold tracking-tight text-base group-hover:text-primary transition-colors">{tx.category}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">{tx.description || 'Global Category'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-black text-lg",
                          tx.type === 'income' ? "text-primary" : "text-destructive"
                        )}>
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1 opacity-40">
                          {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Financial AI</h2>
            <AIInsight budgetUsage={budgetUsage} transactions={transactions} />
          </section>
          
          <section className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8">Budget Efficiency</h3>
            {budgetUsage.length === 0 ? (
              <p className="text-xs text-muted-foreground font-medium italic opacity-60">Set periodic goals to track performance.</p>
            ) : (
              <div className="space-y-8">
                {budgetUsage.map((b: any) => {
                  const percent = Math.min((b.spent / b.amount) * 100, 100);
                  const isExceeded = b.spent > b.amount;
                  const isNearing = !isExceeded && percent > 80;

                  return (
                    <div key={b._id || b.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-bold text-sm tracking-tight">{b.category}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-1">
                            {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-tighter shadow-sm",
                          isExceeded ? "bg-destructive/10 text-destructive" : 
                          isNearing ? "bg-amber-500/10 text-amber-500" : 
                          "bg-primary/10 text-primary"
                        )}>
                          {isExceeded ? 'Limit Hit' : isNearing ? 'Over 80%' : 'Stable'}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={cn(
                            "h-full transition-all rounded-full",
                            isExceeded ? "bg-destructive" : isNearing ? "bg-amber-500" : "bg-primary"
                          )} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-10 pt-8 border-t border-border">
               <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-2xl">
                 <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                 <p className="text-[11px] font-medium leading-relaxed opacity-80">
                   Your current spending velocity is healthy. You are on track to save 12% more than last month.
                 </p>
               </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && <AddTransaction onClose={() => setIsAddModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
