import { useCallback, useEffect, useState } from 'react';
import { jobsService } from '../services/jobs';
import type { Job } from '../types/job';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobsService.listJobs();
      setJobs(result as Job[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (title: string, description: string) => {
    setLoading(true);
    setError(null);
    try {
      const created = await jobsService.createJob({ title, description });
      setJobs((current) => [created as Job, ...current]);
      return created as Job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return { jobs, loading, error, loadJobs, createJob };
};
