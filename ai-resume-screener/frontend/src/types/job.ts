export interface Job {
  id: number;
  title: string;
  description: string;
  created_at?: string;
}

export interface CandidateEvaluation {
  id?: number;
  candidate_id?: number;
  match_score?: number | null;
  matched_skills?: string[] | null;
  missing_skills?: string[] | null;
  summary?: string | null;
  recommendation?: string | null;
  error?: string | null;
  created_at?: string;
}

export interface Candidate {
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
  evaluation?: CandidateEvaluation | null;
}
