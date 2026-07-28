import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Oops</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-3 text-lg text-slate-300">The page crashed while rendering. Please refresh and try again.</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
