import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, PieChart, Smartphone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 glass-card">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-black">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Masroufi</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-400">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm font-bold text-slate-400 px-4 hover:text-white">Sign In</Link>
            <Link to="/auth" className="px-6 py-2.5 bg-primary text-black text-sm font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 text-center lg:text-left grid lg:grid-cols-2 items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Zap size={14} />
              <span>Fintech Intelligence for Tunisia</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-8">
              Contrôlez votre <span className="text-primary italic">Masroufi</span> avec élégance.
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
              Le premier portefeuille intelligent en Tunisie qui utilise l'IA pour vous aider à économiser, budgétiser et atteindre vos objectifs financiers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-primary text-black text-lg font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
                Open Free Wallet <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-5 border-2 border-slate-800 text-lg font-bold rounded-2xl hover:bg-slate-900 transition-all text-slate-300">
                How it works
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative z-10 glass-card p-1 bg-slate-800 border-slate-700 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/fintech-dashboard/1200/900" 
                alt="Masroufi Dashboard" 
                className="rounded-xl shadow-sm opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-white text-center">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature 
              icon={PieChart} 
              title="Smart Analysis" 
              desc="Automatic categorization of your expenses using machine learning tailored to Tunisian patterns." 
            />
            <Feature 
              icon={Shield} 
              title="State Security" 
              desc="Your data is encrypted and safely stored in the cloud. We prioritize your financial privacy." 
            />
            <Feature 
              icon={Zap} 
              title="Instant Insights" 
              desc="Get real-time feedback on your spending habits and smart suggestions to save more." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-black text-[10px] font-black">M</span>
            </div>
            <span className="font-bold tracking-tight">Masroufi</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Masroufi. Proudly made in Tunisia.</p>
        </div>
      </footer>
    </div>
  );
}
