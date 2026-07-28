type StatusBadgeProps = {
  status: string;
};

const styles: Record<string, string> = {
  new: 'bg-slate-700 text-slate-200',
  shortlisted: 'bg-emerald-600/20 text-emerald-300',
  rejected: 'bg-rose-600/20 text-rose-300',
  pending: 'bg-amber-600/20 text-amber-300',
  completed: 'bg-sky-600/20 text-sky-300',
  failed: 'bg-rose-600/20 text-rose-300',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${styles[status] ?? styles.new}`}>
      {status}
    </span>
  );
}
