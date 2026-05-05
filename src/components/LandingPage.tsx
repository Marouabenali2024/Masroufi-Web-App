import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, PieChart, Smartphone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="p-10 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group"
  >
    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold tracking-tight mb-4">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-sm font-medium">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl">M</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">Masroufi</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Intelligence', 'Security'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20">Start Flow</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[150px] rounded-full -mr-1/4 -mt-1/4 animate-pulse" />
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 items-center gap-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
              <Zap size={14} strokeWidth={3} />
              <span>Next-Gen Personal Finance</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-light leading-[0.9] tracking-tighter mb-10">
              Flow with your <span className="text-primary italic font-black uppercase tracking-tighter">Money.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed font-medium">
              The first intelligent personal ledger designed for the modern Tunisian economy. Automate your tracking, optimize your budgets, and reach freedom.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/auth" className="w-full sm:w-auto px-12 py-6 bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 group">
                Begin Journey <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-10 py-6 border-2 border-border text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-secondary transition-all text-muted-foreground">
                View Protocol
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative z-10 p-2 bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden group">
              <img 
                src="https://picsum.photos/seed/fintech-lux/1600/1200" 
                alt="Product Interface" 
                className="rounded-[2.5rem] shadow-inner grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Core Capabilities</h2>
            <p className="text-4xl md:text-5xl font-light tracking-tighter">Everything you need to master your flow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Feature 
              icon={PieChart} 
              title="Automated Analytics" 
              desc="Intelligent categorization that learns from your habits. No manual entry required after training the AI." 
            />
            <Feature 
              icon={Shield} 
              title="Hardened Security" 
              desc="Zero-trust architecture ensures your financial footprints remain private and encrypted forever." 
            />
            <Feature 
              icon={Zap} 
              title="Real-time Pulse" 
              desc="Instant updates across all your devices. Visualize your liquidity and obligations in one interface." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-black">M</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">Masroufi</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-primary transition-colors">Network Status</a>
          </div>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.1em]">© 2026 Masroufi. Engine Built in Tunisia.</p>
        </div>
      </footer>
    </div>
  );
}

