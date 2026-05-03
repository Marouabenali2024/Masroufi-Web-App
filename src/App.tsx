/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setIsLoading]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Chargement de Masroufi...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={user ? <Shell><Dashboard /></Shell> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/analysis" 
          element={user ? <Shell><Analysis /></Shell> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/settings" 
          element={user ? <Shell><BudgetSettings /></Shell> : <Navigate to="/auth" />} 
        />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
