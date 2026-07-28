import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from './ui/ToastProvider';

type JobCardProps = {
  id: number;
  title: string;
  description: string;
  requiredSkills?: string | null;
  minExperience?: number | null;
  onDeleted?: () => void;
};

export function JobCard({ id, title, description, requiredSkills, minExperience, onDeleted }: JobCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteJob(id);
      showToast('Job deleted.', 'success');
      onDeleted?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete job';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:border-violet-500/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${id}`}
            className="rounded-full border border-violet-500/40 px-3 py-1 text-sm font-medium text-violet-300 transition hover:bg-violet-500/10"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-full border border-rose-500/40 px-3 py-1 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        {requiredSkills ? <span className="rounded-full bg-slate-800 px-3 py-1">Skills: {requiredSkills}</span> : null}
        {minExperience !== null && minExperience !== undefined ? (
          <span className="rounded-full bg-slate-800 px-3 py-1">Min exp: {minExperience}+ years</span>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
    </article>
  );
}
