"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-text-secondary mb-8">
            An unexpected error occurred. Please try refreshing the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold shadow-btn active:scale-95 transition-transform"
          >
            <RefreshCcw size={20} />
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
