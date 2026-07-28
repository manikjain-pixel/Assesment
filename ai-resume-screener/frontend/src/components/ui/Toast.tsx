import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
};

const toneStyles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  info: 'border-slate-700 bg-slate-900/80 text-slate-200',
} as const;

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-xl ${toneStyles[type]}`}>
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button type="button" onClick={onClose} className="font-semibold text-current">
          ×
        </button>
      </div>
    </div>
  );
}
