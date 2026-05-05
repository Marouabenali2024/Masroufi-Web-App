import React from 'react';
import { motion } from 'motion/react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { PieChart, TrendingUp } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { formatCurrency, cn } from '@/src/lib/utils';

const COLORS = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export default function Analysis() {
  const { transactions, theme } = useStore();

  const dataByCategory = transactions.reduce((acc: any[], curr) => {
    if (curr.type === 'expense') {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
    }
    return acc;
  }, []);

  const dataByMonth = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      const mKey = d.toISOString().slice(0, 7); // YYYY-MM
      
      const monthData = transactions.filter(tx => tx.date.startsWith(mKey));
      const income = monthData.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
      const expense = monthData.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
      
      last6Months.push({ name: mName, income, expense });
    }
    return last6Months;
  }, [transactions]);

  const chartTheme = theme === 'dark' ? {
    stroke: '#27272a',
    text: '#a1a1aa',
    tooltip: { bg: '#09090b', b: '#27272a' }
  } : {
    stroke: '#e4e4e7',
    text: '#71717a',
    tooltip: { bg: '#ffffff', b: '#e4e4e7' }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-light tracking-tighter"
        >
          Analysis
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2 font-medium"
        >
          Intelligence & Trends for your financial data.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Spending by Category */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10">Category Mix</h3>
          <div className="h-80 w-full">
            {dataByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={dataByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartTheme.tooltip.bg, border: `1px solid ${chartTheme.tooltip.b}`, borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <PieChart size={40} className="mb-4 stroke-1 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Insufficient data</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10">Cashflow Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataByMonth}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chartTheme.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 'bold' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: chartTheme.tooltip.bg, border: `1px solid ${chartTheme.tooltip.b}`, borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="income" stroke="var(--primary)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="var(--destructive)" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <section className="mt-12 bg-card border border-border p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 relative z-10">Historical Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
          {[
            { label: 'Avg Monthly Spend', value: '1,450 TND', change: '-4.2%' },
            { label: 'Savings Velocity', value: '22%', change: '+12.5%' },
            { label: 'Fixed Obligations', value: '850 TND', change: 'Stable' },
            { label: 'Asset Growth', value: '+5.4%', change: 'Accelerating' },
          ].map((stat, i) => (
            <div key={i} className="space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] leading-none">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-light tracking-tighter">{stat.value}</p>
              </div>
              <p className={cn(
                "text-[9px] font-black uppercase inline-block px-1.5 py-0.5 rounded",
                stat.change.includes('+') ? "bg-primary/10 text-primary" : 
                stat.change.includes('-') ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
              )}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

