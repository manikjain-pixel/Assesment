export type JobRecord = {
  id: number;
  title: string;
  description: string;
  required_skills?: string | null;
  min_experience?: number | null;
  created_at?: string;
};

export type EvaluationRecord = {
  id?: number;
  candidate_id?: number;
  match_score?: number | null;
  matched_skills?: string[] | null;
  missing_skills?: string[] | null;
  summary?: string | null;
  recommendation?: string | null;
  error?: string | null;
  created_at?: string;
};

export type CandidateRecord = {
  id: number;
  job_id: number;
  name?: string;
  email?: string | null;
  resume_text?: string | null;
  experience?: number | null;
  status?: string;
  created_at?: string;
  evaluation?: EvaluationRecord | null;
};

export type ApiErrorShape = {
  message: string;
  status: number;
  details?: unknown;
};
