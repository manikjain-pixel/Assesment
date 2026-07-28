import { useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { useToast } from './ui/ToastProvider';

type ResumeUploadProps = {
  jobId: number;
  onUploaded?: () => void;
};

type UploadPhase = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

const ACCEPTED_TYPES = '.pdf,.txt';

export function ResumeUpload({ jobId, onUploaded }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [message, setMessage] = useState<string>('');
  const { showToast } = useToast();

  const selectedLabel = useMemo(() => file?.name ?? 'No file selected', [file]);

  const resetState = () => {
    setPhase('idle');
    setMessage('');
    setFile(null);
  };

  const validateFile = (candidate: File | null) => {
    if (!candidate) {
      setPhase('error');
      setMessage('Choose a PDF or text file first.');
      return null;
    }

    const extension = candidate.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'txt') {
      setPhase('error');
      setMessage('Only .pdf and .txt files are supported.');
      return null;
    }

    return candidate;
  };

  const handleUpload = async (candidate: File | null) => {
    const nextFile = validateFile(candidate);
    if (!nextFile) {
      return;
    }

    setFile(nextFile);
    setPhase('uploading');
    setMessage('Uploading resume...');

    try {
      await api.uploadResume(jobId, nextFile);
      setPhase('success');
      setMessage('Resume uploaded successfully.');
      setFile(null);
      showToast('Resume uploaded successfully.', 'success');
      onUploaded?.();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Unable to upload resume.';
      setPhase('error');
      setMessage(nextMessage);
      showToast(nextMessage, 'error');
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    void handleUpload(selected);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPhase('dragging');
    const dropped = event.dataTransfer.files?.[0] ?? null;
    void handleUpload(dropped);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPhase('dragging');
  };

  const onDragLeave = () => {
    setPhase('idle');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Upload resume</h3>
          <p className="mt-2 text-sm text-slate-400">Drag and drop a resume or click to browse supported files.</p>
        </div>
        {phase === 'success' ? (
          <button type="button" onClick={resetState} className="text-sm font-medium text-violet-300 transition hover:text-violet-200">
            Reset
          </button>
        ) : null}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          phase === 'dragging'
            ? 'border-violet-400 bg-violet-500/10'
            : phase === 'uploading'
              ? 'border-sky-400/60 bg-sky-500/10'
              : phase === 'success'
                ? 'border-emerald-400/60 bg-emerald-500/10'
                : phase === 'error'
                  ? 'border-rose-400/60 bg-rose-500/10'
                  : 'border-slate-700 bg-slate-950/50'
        }`}
      >
        <p className="text-sm font-medium text-slate-200">{phase === 'uploading' ? 'Uploading...' : 'Drop your resume here'}</p>
        <p className="mt-2 text-sm text-slate-400">Accepted formats: {ACCEPTED_TYPES}</p>
        <p className="mt-4 text-sm text-slate-500">{selectedLabel}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={onInputChange}
        className="sr-only"
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className={`text-sm ${phase === 'error' ? 'text-rose-400' : phase === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
          {message || 'No upload started yet.'}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Choose file
        </button>
      </div>
    </div>
  );
}
