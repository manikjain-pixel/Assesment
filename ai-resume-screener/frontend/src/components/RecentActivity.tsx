type RecentActivityProps = {
  candidates: Array<{
    id: number;
    name: string;
    status: string;
    created_at?: string;
  }>;
};

export function RecentActivity({ candidates }: RecentActivityProps) {
  const recent = [...candidates]
    .sort((left, right) => Number(new Date(right.created_at ?? 0)) - Number(new Date(left.created_at ?? 0)))
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent activity</h3>
        <span className="text-sm text-slate-400">Latest candidates</span>
      </div>

      {recent.length ? (
        <ul className="mt-4 space-y-3">
          {recent.map((candidate) => (
            <li key={candidate.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-200">{candidate.name}</p>
                <p className="text-xs text-slate-500">
                  {candidate.created_at ? new Date(candidate.created_at).toLocaleString() : 'Recently added'}
                </p>
              </div>
              <span className="rounded-full bg-violet-600/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                {candidate.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No activity yet. Upload a resume to get started.</p>
      )}
    </div>
  );
}
