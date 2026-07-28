import type { CandidateRecord, JobRecord } from '../types/api';

type NormalizedCandidate = {
  candidate: {
    id: number;
    job_id: number;
    name: string;
    email?: string | null;
    resume_text?: string | null;
    experience?: number | null;
    status: string;
    created_at?: string;
  };
  evaluation?: {
    match_score?: number | null;
    summary?: string | null;
    recommendation?: string | null;
    matched_skills?: string[] | null;
    missing_skills?: string[] | null;
  } | null;
};

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  skipJsonParse?: boolean;
};

const BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api')).replace(/\/$/, '');

// Shared API error object for consistent frontend handling.
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Reusable wrapper around the Fetch API with JSON parsing and error normalization.
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipJsonParse = false } = options;

  const isFormData = body instanceof FormData;
  const fetchHeaders: HeadersInit = isFormData
    ? headers
    : {
        'Content-Type': 'application/json',
        ...headers,
      };

  const config: RequestInit = {
    method,
    headers: fetchHeaders,
  };

  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, config);
  const contentType = response.headers.get('content-type') || '';

  const isJson = contentType.includes('application/json');
  let payload: unknown = null;

  if (skipJsonParse) {
    payload = await response.text();
  } else if (isJson) {
    payload = await response.json().catch(() => null);
  } else if (response.status !== 204) {
    payload = await response.text();
  }

  if (!response.ok) {
    const message =
      (payload as { detail?: string } | undefined)?.detail ||
      (payload as { message?: string } | undefined)?.message ||
      'Request failed';
    throw new ApiError(message, response.status, payload);
  }

  if (skipJsonParse) {
    return payload as T;
  }

  return (payload as T) ?? ({} as T);
}

function createLoadingState<T>() {
  return {
    data: null as T | null,
    loading: false,
    error: null as string | null,
  };
}

export const api = {
  baseURL: BASE_URL,
  request,
  createLoadingState,
  async getJobs() {
    return request<JobRecord[]>('/jobs');
  },
  async createJob(job: { title: string; description: string; required_skills?: string | null; min_experience?: number | null }) {
    return request<JobRecord>('/jobs', { method: 'POST', body: job });
  },
  async deleteJob(jobId: number) {
    return request<void>(`/jobs/${jobId}`, { method: 'DELETE' });
  },
  async uploadResume(jobId: number, file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    return request('/resumes/jobs/' + jobId + '/candidates', {
      method: 'POST',
      body: formData,
      headers: {},
      skipJsonParse: true,
    });
  },
  async getCandidates(jobId: number, params?: { status?: string; min_score?: number }) {
    const search = new URLSearchParams();
    if (params?.status) {
      search.set('status', params.status);
    }
    if (params?.min_score !== undefined) {
      search.set('min_score', String(params.min_score));
    }

    const suffix = search.toString() ? `?${search.toString()}` : '';
    const payload = await request<Array<{ candidate: CandidateRecord; evaluation?: unknown }>>(`/jobs/${jobId}/candidates${suffix}`);
    return payload.map((item) => ({
      candidate: {
        id: item.candidate.id,
        job_id: item.candidate.job_id,
        name: item.candidate.name ?? `Candidate ${item.candidate.id}`,
        email: item.candidate.email,
        resume_text: item.candidate.resume_text,
        experience: item.candidate.experience,
        status: item.candidate.status ?? 'pending',
        created_at: item.candidate.created_at,
      },
      evaluation: item.evaluation as NormalizedCandidate['evaluation'],
    })) as NormalizedCandidate[];
  },
  async updateCandidate(candidateId: number, status: string) {
    return request<CandidateRecord>(`/candidates/${candidateId}`, { method: 'PATCH', body: { status } });
  },
  async deleteCandidate(candidateId: number) {
    return request<void>(`/candidates/${candidateId}`, { method: 'DELETE' });
  },
};

