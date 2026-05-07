import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, Settings, LogOut, Bell, Search, User, Menu, AlertTriangle, AlertCircle, Sun, Moon } from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { useStore } from '@/src/store/useStore';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, setTransactions, setBudgets, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const fetchData = React.useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const [txData, bgData] = await Promise.all([
        api.getTransactions(user.uid),
        api.getBudgets(user.uid, currentMonth)
      ]);
      setTransactions(txData);
      setBudgets(bgData);
      setGlobalError(null);
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (msg === "Failed to fetch") {
        msg = "The server is currently unavailable or starting up. If this persists, please ensure the backend is running.";
      }
      setGlobalError(msg);
      console.error("Error fetching global data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, currentMonth, setTransactions, setBudgets]);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-black text-sm">M</span>
          </div>
          <span className="font-bold">Masroufi</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-muted-foreground">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-muted-foreground">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 md:relative md:translate-x-0 overflow-y-auto flex flex-col shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl">M</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Masroufi</span>
        </div>

        <nav className="flex-1 px-4 py-8">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-4 px-6">Main Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-6 py-3 rounded-xl font-semibold transition-all group relative",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {window.location.pathname === item.path && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
            <p className="text-xs text-primary font-bold mb-1">Masroufi Pro</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Upgrade to unlock detailed PDF reports and multi-currency support.</p>
          </div>

          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary font-black overflow-hidden shadow-sm">
               {user?.photoURL ? <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" /> : (user?.displayName?.[0] || 'U')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <button 
                onClick={handleSignOut}
                className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive font-bold transition-colors"
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
        <header className="hidden md:flex items-center justify-between px-10 py-6 bg-card border-b border-border sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
            <p className="text-xs text-muted-foreground">Monitor your financial health in real-time.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-64 pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
              </button>
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-primary/5">
                {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="bg-background flex-1 relative p-4 md:p-8">
          {globalError && (
            <div className="mx-10 mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4 text-amber-200">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div className="text-sm flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">System Connection Issue</p>
                  <button 
                    onClick={() => fetchData()} 
                    disabled={isRefreshing}
                    className="text-[10px] uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {isRefreshing ? 'Retrying...' : 'Retry Now'}
                  </button>
                </div>
                <p className="opacity-80 mt-1">{globalError}</p>
                {globalError.includes('Insufficient permissions') && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-medium">To fix this permission issue:</p>
                    <ul className="list-disc list-inside space-y-0.5 opacity-90">
                      <li>Ensure your Firebase Security Rules are correctly deployed.</li>
                      <li>Check if your user account has the required access levels.</li>
                    </ul>
                  </div>
                )}
                {globalError.includes('FIREBASE_SERVICE_ACCOUNT_KEY') && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-medium">Server Configuration Issue:</p>
                    <p className="opacity-90">The Firebase Admin SDK is missing credentials. Please add <code className="bg-amber-500/20 px-1 rounded">FIREBASE_SERVICE_ACCOUNT_KEY</code> to Secrets.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
