import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CandidateList } from '../components/CandidateList';
import { FilterBar } from '../components/FilterBar';
import { RecentActivity } from '../components/RecentActivity';
import { ResumeUpload } from '../components/ResumeUpload';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/api';

type Candidate = {
  candidate: {
    id: number;
    name: string;
    status: string;
    email?: string | null;
    resume_text?: string | null;
    experience?: number | null;
    created_at?: string;
  };
  evaluation?: {
    match_score?: number | null;
    summary?: string | null;
    recommendation?: string | null;
    matched_skills?: string[] | null;
    missing_skills?: string[] | null;
  } | null;
};

type Job = {
  id: number;
  title: string;
  description: string;
  required_skills?: string | null;
  min_experience?: number | null;
};

export function JobDetailsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [minScore, setMinScore] = useState(0);

  const loadJob = async () => {
    if (!jobId) {
      return;
    }

    try {
      const jobs = await api.getJobs();
      const selectedJob = jobs.find((item) => String(item.id) === jobId) ?? null;
      setJob(selectedJob);
    } catch {
      setError('Unable to load job details');
    }
  };

  const loadCandidates = async () => {
    if (!jobId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getCandidates(Number(jobId), {
        status: status || undefined,
        min_score: minScore || undefined,
      });
      setCandidates((data as Array<{ candidate: Candidate['candidate']; evaluation?: Candidate['evaluation'] }>).map((item) => ({
        candidate: item.candidate,
        evaluation: item.evaluation,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJob();
    void loadCandidates();
  }, [jobId]);

  const selectedJobId = useMemo(() => Number(jobId), [jobId]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <Link to="/jobs" className="inline-flex items-center text-sm font-medium text-violet-300 transition hover:text-violet-200">
          ← Back to jobs
        </Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">Job details</p>
        {job ? (
          <>
            <h1 className="mt-3 text-4xl font-semibold text-white">{job.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">{job.description}</p>
          </>
        ) : (
          <h1 className="mt-3 text-4xl font-semibold text-white">Loading job…</h1>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <ResumeUpload jobId={selectedJobId} onUploaded={() => void loadCandidates()} />
          <RecentActivity candidates={candidates.map((item) => ({ id: item.candidate.id, name: item.candidate.name, status: item.candidate.status, created_at: item.candidate.created_at }))} />
        </div>

        <div className="space-y-4">
          <FilterBar
            status={status}
            minScore={minScore}
            onStatusChange={setStatus}
            onMinScoreChange={setMinScore}
            onApply={() => void loadCandidates()}
          />
          {!loading && !error && !candidates.length ? (
            <EmptyState title="No candidates found" description="Try adjusting the filters or upload a resume to get started." />
          ) : null}
          <CandidateList
            candidates={candidates}
            loading={loading}
            error={error}
            onRefresh={() => void loadCandidates()}
          />
        </div>
      </section>
    </main>
  );
}
