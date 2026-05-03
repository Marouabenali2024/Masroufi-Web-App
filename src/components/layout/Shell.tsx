import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, Settings, LogOut, Bell, Search, User, Menu } from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { useStore } from '@/src/store/useStore';
import { cn } from '@/src/lib/utils';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PieChart, label: 'Analysis', path: '/analysis' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-secondary border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">M</span>
          </div>
          <span className="font-bold text-white">Masroufi</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-secondary border-r border-slate-800 text-white transform transition-transform duration-300 md:relative md:translate-x-0 overflow-y-auto flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-xl">M</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Masroufi</span>
        </div>

        <nav className="flex-1 px-4 py-8">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-4 px-6">Main Menu</p>
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-6 py-3 rounded-xl font-semibold transition-all group",
                  isActive ? "bg-slate-800/50 text-primary" : "text-slate-400 hover:text-white"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
            <p className="text-xs text-primary font-bold mb-1 italic">Pro Account</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">Manage multiple wallets and export detailed PDF reports.</p>
          </div>

          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary font-black overflow-hidden">
               {user?.photoURL ? <img src={user.photoURL} alt={user.displayName || ''} /> : (user?.displayName?.[0] || 'U')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user?.displayName}</p>
              <button 
                onClick={handleSignOut}
                className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-rose-400 font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Horizontal Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 bg-secondary border-b border-slate-800 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
            <p className="text-xs text-slate-500">Tuned in for your daily expenses in Tunis.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full outline-none focus:border-primary transition-all text-sm text-slate-200"
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-primary/10">
                 {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="bg-background flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
