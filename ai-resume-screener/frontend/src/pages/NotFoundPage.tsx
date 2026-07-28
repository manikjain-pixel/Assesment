import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-lg text-slate-300">The page you are looking for does not exist or has moved.</p>
        <Link to="/jobs" className="mt-6 inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500">
          Back to jobs
        </Link>
      </div>
    </main>
  );
}
