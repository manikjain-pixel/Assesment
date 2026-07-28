from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class CandidateResponse(BaseModel):
    id: int
    job_id: int
    name: str
    email: Optional[str] = None
    resume_text: Optional[str] = None
    experience: Optional[int] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluationResponse(BaseModel):
    id: int
    candidate_id: int
    match_score: Optional[int] = None
    matched_skills: Optional[list[str]] = None
    missing_skills: Optional[list[str]] = None
    summary: Optional[str] = None
    recommendation: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)


class CandidateWithEvaluationResponse(BaseModel):
    candidate: CandidateResponse
    evaluation: Optional[EvaluationResponse] = None

    model_config = ConfigDict(from_attributes=True)

