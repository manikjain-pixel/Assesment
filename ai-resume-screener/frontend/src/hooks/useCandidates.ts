import { useState } from 'react';
import { jobsService } from '../services/jobs';
import type { Candidate } from '../types/job';

export const useCandidates = (jobId: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadResume = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobsService.uploadResume(jobId, file);
      setCandidates((current) => [result as Candidate, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return { candidates, loading, error, uploadResume };
};
