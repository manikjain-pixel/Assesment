import { useState } from 'react';

type FilterBarProps = {
  status: string;
  minScore: number;
  onStatusChange: (value: string) => void;
  onMinScoreChange: (value: number) => void;
  onApply: () => void;
};

export function FilterBar({ status, minScore, onStatusChange, onMinScoreChange, onApply }: FilterBarProps) {
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftMinScore, setDraftMinScore] = useState(minScore);

  const handleApply = () => {
    onStatusChange(draftStatus);
    onMinScoreChange(draftMinScore);
    onApply();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm text-slate-300">
          <span className="mb-2 block">Status</span>
          <select
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>

        <label className="w-full text-sm text-slate-300 md:max-w-[240px]">
          <div className="mb-2 flex items-center justify-between">
            <span>Minimum score</span>
            <span className="text-violet-300">{draftMinScore}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={draftMinScore}
            onChange={(event) => setDraftMinScore(Number(event.target.value))}
            className="w-full accent-violet-500"
          />
        </label>

        <button
          type="button"
          onClick={handleApply}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
