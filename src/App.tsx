/**
 * App.tsx — Fixed Version
 *
 * FIXES:
 * 1. isLoading starts as `true` — prevents flash/redirect before auth check
 * 2. Loading spinner uses dark background matching app theme
 * 3. Cleaner route guards
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store/useStore';

// Components
import Shell from './components/layout/Shell';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Analysis from './components/Analysis';
import BudgetSettings from './components/BudgetSettings';

export default function App() {
  const { setUser, setIsLoading, isLoading, user } = useStore();

  React.useEffect(() => {
    // ✅ FIX 1: Set loading true immediately before subscribing
    // This prevents the app from briefly rendering /auth before Firebase
    // has confirmed there IS an active session.
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false); // ← only set false AFTER Firebase responds
    });

    return () => unsubscribe();
  }, [setUser, setIsLoading]);

  // ✅ FIX 2: Show loading screen while Firebase confirms auth state
  // This prevents the unwanted flash to /auth for already-logged-in users
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-950">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-slate-800 rounded-full" />
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-white font-bold tracking-widest text-xs uppercase">
            Masroufi
          </p>
          <p className="text-slate-500 text-xs animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/auth"
          element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={user ? <Shell><Dashboard /></Shell> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/analysis"
          element={user ? <Shell><Analysis /></Shell> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/settings"
          element={user ? <Shell><BudgetSettings /></Shell> : <Navigate to="/auth" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
