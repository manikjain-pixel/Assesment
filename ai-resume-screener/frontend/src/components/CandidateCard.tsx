import { useState } from 'react';
import { api } from '../services/api';
import { useToast } from './ui/ToastProvider';
import { StatusBadge } from './StatusBadge';

type CandidateCardProps = {
  candidate: {
    candidate: {
      id: number;
      name?: string;
      status?: string;
      resume_text?: string | null;
      email?: string | null;
      experience?: number | null;
    };
    evaluation?: {
      match_score?: number | null;
      summary?: string | null;
      recommendation?: string | null;
      matched_skills?: string[] | null;
      missing_skills?: string[] | null;
    } | null;
  };
  onUpdated?: () => void;
};

export function CandidateCard({ candidate, onUpdated }: CandidateCardProps) {
  const currentCandidate = candidate.candidate;
  const [currentStatus, setCurrentStatus] = useState(currentCandidate.status ?? 'new');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      await api.updateCandidate(currentCandidate.id, status);
      setCurrentStatus(status);
      showToast(`Candidate marked as ${status}.`, 'success');
      onUpdated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update status';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await api.deleteCandidate(currentCandidate.id);
      showToast('Candidate removed.', 'success');
      onUpdated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to remove candidate';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{currentCandidate.name ?? `Candidate ${currentCandidate.id}`}</h3>
          <p className="mt-1 text-sm text-slate-400">{currentCandidate.email ?? 'No email provided'}</p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Match score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{candidate.evaluation?.match_score ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Recommendation</p>
          <p className="mt-2 text-sm font-medium text-slate-200">{candidate.evaluation?.recommendation ?? 'Pending review'}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">Matched skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(candidate.evaluation?.matched_skills?.length ? candidate.evaluation.matched_skills : ['No matched skills recorded']).map((skill) => (
              <span key={skill} className="rounded-full bg-emerald-600/15 px-3 py-1 text-xs font-medium text-emerald-300">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Missing skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(candidate.evaluation?.missing_skills?.length ? candidate.evaluation.missing_skills : ['No missing skills recorded']).map((skill) => (
              <span key={skill} className="rounded-full bg-rose-600/15 px-3 py-1 text-xs font-medium text-rose-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => void handleStatusChange('shortlisted')}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Shortlist
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => void handleStatusChange('rejected')}
          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject
        </button>
        <button
          type="button"
          disabled={isDeleting || isUpdating}
          onClick={() => void handleDelete()}
          className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? 'Removing…' : 'Remove'}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </article>
  );
}
