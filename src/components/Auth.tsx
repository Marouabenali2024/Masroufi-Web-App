import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Sparkles, ShieldCheck } from "lucide-react";
import { auth } from "@/src/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function Auth() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // 1. معالجة عودة المستخدم من Google بعد الـ Redirect
  useEffect(() => {
    const checkGoogleResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // تم تسجيل الدخول بنجاح
          console.log("تم الدخول بنجاح:", result.user);
          // هنا يمكنك إضافة توجيه لصفحة الـ Dashboard إذا أردتِ
          // window.location.href = "/dashboard"; 
        }
      } catch (err: any) {
        console.error("خطأ في العودة من Google:", err);
        setError("حدث خطأ أثناء الاتصال بحساب Google، حاول مجدداً.");
      }
    };
    checkGoogleResult();
  }, []);

  // 2. دالة تسجيل الدخول بـ Google (Redirect)
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    setIsLoading(true);
    setError(null);
    try {
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError("تعذر فتح صفحة Google. يرجى المحاولة مرة أخرى.");
      setIsLoading(false);
    }
  };

  // 3. دالة تسجيل الدخول بالبريد الإلكتروني
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("خدمة التسجيل غير مفعلة في Firebase Console.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مستخدم بالفعل.");
      } else {
        setError("حدث خطأ في المصادقة. يرجى التحقق من البيانات.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* القسم الجمالي (Visual Side) */}
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
            Manage your money with{" "}
            <span className="text-secondary-foreground underline decoration-accent underline-offset-8">
              Intelligence
            </span>
            .
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

      {/* قسم النموذج (Form Side) */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isSignUp ? "Join Masroufi to start managing your budget" : "Sign in to manage your budget"}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-800 rounded-2xl hover:bg-slate-900 transition-all font-bold text-slate-300 disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
            </button>
          </div>

          <div className="my-8 flex items-center gap-4 text-slate-800">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">OR</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-rose-500 text-sm font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {isSignUp ? "Create Free Account" : "Sign In with Email"}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Sign up for free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}