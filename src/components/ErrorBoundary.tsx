import React from 'react';
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border p-8 rounded-[2.5rem] shadow-xl text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the application.
            </p>
            <div className="bg-destructive/5 p-4 rounded-2xl mb-8 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-destructive/60 mb-1">Error Message</p>
              <p className="text-xs font-mono break-all">{this.state.error?.message}</p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-3xl font-bold hover:shadow-lg transition-all active:scale-95"
            >
              <RotateCcw size={18} />
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return (this.props.children as any) || null;
  }
}
