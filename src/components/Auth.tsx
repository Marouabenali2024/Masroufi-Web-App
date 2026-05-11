/**
 * Auth.tsx — Fixed Version
 *
 * FIXES:
 * 1. Toggle buttons: removed broken `disabled` logic — now both always clickable
 * 2. Google Sign-In: uses signInWithRedirect on mobile as fallback for popup-blocked
 * 3. Sign Up: saves displayName + createdAt to Firestore after account creation
 * 4. Confirm password field added for Sign Up (prevents typos)
 * 5. Password visibility toggle added
 * 6. "Forgot password" sends reset email via Firebase
 * 7. Auth errors: added missing `auth/invalid-credential` (Firebase v10+)
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn, Mail, Sparkles, ShieldCheck, AlertCircle, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Auth() {
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'reset'>('signin');
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form fields
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const switchMode = (next: 'signin' | 'signup' | 'reset') => {
    clearMessages();
    setMode(next);
  };

  /** Map Firebase error codes to friendly messages */
  const getErrorMessage = (err: any): string => {
    switch (err.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Trying redirect sign-in instead...';
      case 'auth/operation-not-allowed':
        return "This sign-in method isn't enabled. Enable it in Firebase Console → Authentication.";
      case 'auth/user-not-found':
        return 'No account found with this email. Did you mean to sign up?';
      case 'auth/wrong-password':
      case 'auth/invalid-credential': // Firebase v10+ unified error
        return 'Incorrect email or password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few minutes and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return err.message || 'Authentication failed. Please try again.';
    }
  };

  // ─── Save user profile to Firestore after Sign Up ─────────────────────────

  const saveUserToFirestore = async (uid: string, name: string, email: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        displayName: name,
        email,
        createdAt: serverTimestamp(),
        provider: 'email',
      }, { merge: true }); // merge:true won't overwrite existing data
    } catch (e) {
      console.warn('[Firestore] Could not save user profile:', e);
      // Non-fatal — auth still succeeded
    }
  };

  // ─── Google Sign-In ────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    setIsLoading(true);
    clearMessages();

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Save to Firestore (merge so we don't overwrite existing data)
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: 'google',
          lastSignIn: serverTimestamp(),
        }, { merge: true });

        setSuccessMessage(`Welcome ${result.user.displayName || 'back'}! Redirecting...`);
      }
    } catch (err: any) {
      console.error('[Google Sign-In]', err);

      // ✅ FIX: If popup is blocked, fall back to redirect
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          // User will be redirected — no need to set error
          return;
        } catch (redirectErr: any) {
          setError(getErrorMessage(redirectErr));
        }
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Email Auth ────────────────────────────────────────────────────────────

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // ✅ FIX: Create account + save displayName + save to Firestore
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Save displayName to Firebase Auth profile
        await updateProfile(result.user, { displayName: displayName.trim() });

        // Save to Firestore
        await saveUserToFirestore(result.user.uid, displayName.trim(), email);

        setSuccessMessage('Account created! Redirecting...');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Signed in! Redirecting...');
      }
    } catch (err: any) {
      console.error('[Email Auth]', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Password Reset ────────────────────────────────────────────────────────

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Reset email sent! Check your inbox (and spam folder).');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Visual Side ── */}
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
            Manage your money with{' '}
            <span className="text-secondary-foreground underline decoration-accent underline-offset-8">
              Intelligence
            </span>.
          </motion.h1>
          <p className="mt-6 text-emerald-100 text-lg max-w-sm">
            Join thousands of Tunisians using Masroufi to track expenses and save for the future.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <ShieldCheck className="text-accent" />
            <p className="font-bold">Secure Banking</p>
            <p className="text-sm text-emerald-100">Bank-grade security protocols.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Sparkles className="text-accent" />
            <p className="font-bold">AI Insights</p>
            <p className="text-sm text-emerald-100">Smart tips tailored to your spending habits.</p>
          </div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="inline-flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">M</span>
            </div>
            <span className="text-lg font-bold">Masroufi</span>
          </div>

          {/* ── Mode Tabs ── */}
          {mode !== 'reset' && (
            <div className="flex gap-2 mb-8">
              {/* ✅ FIX: Removed broken disabled logic — both tabs always clickable */}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === 'signin'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === 'signup'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* ── Title ── */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {mode === 'signin' && 'Sign in to manage your budget'}
                  {mode === 'signup' && 'Join Masroufi to start managing your budget'}
                  {mode === 'reset' && 'Enter your email to receive a reset link'}
                </p>
              </div>

              {/* ── Google Button (not on reset) ── */}
              {mode !== 'reset' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-800 rounded-2xl hover:bg-slate-900 transition-all font-bold text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                    )}
                    <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </button>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600">OR</span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                </>
              )}

              {/* ── Form ── */}
              <form
                onSubmit={mode === 'reset' ? handlePasswordReset : handleEmailAuth}
                className="space-y-5"
              >
                {/* Name field — Sign Up only */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                      placeholder="Maroua Ben Ali"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                      placeholder="name@company.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password (not on reset) */}
                {mode !== 'reset' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 pr-12 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      {/* ✅ FIX: Password visibility toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password — Sign Up only */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-4 bg-slate-900/50 border rounded-2xl outline-none focus:border-primary transition-all text-white placeholder:text-slate-700 ${
                          confirmPassword && confirmPassword !== password
                            ? 'border-rose-500'
                            : 'border-slate-800'
                        }`}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-rose-500 text-xs mt-1 ml-1">Passwords don't match</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Forgot password link */}
                {mode === 'signin' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs text-slate-500 hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-rose-500 text-sm font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex gap-2 items-start"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Success */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-green-500 text-sm font-medium bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex gap-2 items-start"
                  >
                    <div className="w-4 h-4 rounded-full bg-green-500 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || (mode === 'signup' && !!confirmPassword && confirmPassword !== password)}
                  className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  )}
                  {mode === 'signup' && 'Create Free Account'}
                  {mode === 'signin' && 'Sign In with Email'}
                  {mode === 'reset' && (
                    <>
                      <KeyRound size={16} />
                      Send Reset Email
                    </>
                  )}
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-6 text-center text-slate-600 text-sm space-y-2">
                {mode === 'reset' ? (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-primary font-bold hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                ) : (
                  <p>
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                      className="text-primary font-bold hover:underline"
                    >
                      {mode === 'signup' ? 'Sign in' : 'Sign up for free'}
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
