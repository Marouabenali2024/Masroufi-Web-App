import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useStore } from '@/src/store/useStore';
import { formatCurrency } from '@/src/lib/utils';

const COLORS = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export default function Analysis() {
  const { transactions } = useStore();

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

  const dataByMonth = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-secondary">Analysis</h1>
        <p className="text-slate-500 mt-1">Plongez dans les détails de vos finances</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Spending by Category</h3>
          <div className="h-80 w-full">
            {dataByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No expense data available for analysis.
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Monthly Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <section className="mt-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8">Advanced Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Avg Monthly Spending', value: '1,450 TND' },
            { label: 'Savings Rate', value: '22%' },
            { label: 'Recurring Bills', value: '850 TND' },
            { label: 'Net Worth Growth', value: '+5.4%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
