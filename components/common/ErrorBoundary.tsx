// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-slate-200 h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Oops! Something went wrong.</h1>
            <p className="text-slate-300 mb-6">A critical error occurred in the application. Please try refreshing the page.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
                Refresh Page
            </button>
             {this.state.error && (
                <details className="mt-6 text-left w-full max-w-lg">
                    <summary className="cursor-pointer text-slate-400 hover:text-white">Error Details</summary>
                    <pre className="mt-2 p-2 bg-slate-800 text-red-300 text-xs rounded-md overflow-auto">
                        {this.state.error.stack || this.state.error.toString()}
                    </pre>
                </details>
             )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;