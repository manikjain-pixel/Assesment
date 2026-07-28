import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobForm } from '../components/JobForm';
import { JobCard } from '../components/JobCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/api';

type Job = {
  id: number;
  title: string;
  description: string;
  required_skills?: string | null;
  min_experience?: number | null;
};

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">AI Resume Screener</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Create and manage hiring opportunities</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Build jobs, upload resumes, and evaluate candidates with a reusable, component-driven interface.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Jobs</h2>
            <button
              type="button"
              onClick={() => void loadJobs()}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-violet-500 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loading ? <LoadingSpinner /> : null}
          {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</p> : null}
          {!loading && !error ? (
            jobs.length ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    description={job.description}
                    requiredSkills={job.required_skills}
                    minExperience={job.min_experience}
                    onDeleted={() => void loadJobs()}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No jobs yet" description="Create a role to begin screening candidates." />
            )
          ) : null}
        </div>

        <JobForm onSuccess={() => void loadJobs()} />
      </section>
    </main>
  );
}
