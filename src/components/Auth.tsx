import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Github, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

export default function Auth() {
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex fintech-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary font-black text-xl">M</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Masroufi</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold leading-tight max-w-md"
          >
            Manage your money with <span className="text-secondary-foreground underline decoration-accent underline-offset-8">Intelligence</span>.
          </motion.h1>
          <p className="mt-6 text-emerald-100 text-lg max-w-sm">
            Join thousands of Tunisians using Masroufi to track expenses and save for the future.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <ShieldCheck className="text-accent" />
            <p className="font-bold">Secure Banking</p>
            <p className="text-sm text-emerald-100">Bank-grade security protocols for your data.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Sparkles className="text-accent" />
            <p className="font-bold">AI Insights</p>
            <p className="text-sm text-emerald-100">Smart tips tailored to your spending habits.</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Sign in to manage your budget</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-800 rounded-2xl hover:bg-slate-900 transition-all font-bold text-slate-300"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="my-8 flex items-center gap-4 text-slate-800">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">OR</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}

            <button 
              disabled
              className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Sign In with Email
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            Don't have an account? <a href="#" className="text-primary font-bold hover:underline">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
