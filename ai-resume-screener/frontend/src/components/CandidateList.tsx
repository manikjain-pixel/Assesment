import { LoadingSpinner } from './LoadingSpinner';
import { CandidateCard } from './CandidateCard';

type CandidateListProps = {
  candidates: Array<{
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
  }>;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
};

export function CandidateList({ candidates, loading, error, onRefresh }: CandidateListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</p>;
  }

  if (!candidates.length) {
    return <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">No candidates yet.</p>;
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.candidate.id} candidate={candidate} onUpdated={onRefresh} />
      ))}
    </div>
  );
}
