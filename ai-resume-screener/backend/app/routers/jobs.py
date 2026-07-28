from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.job import JobCreate, JobResponse
from app.schemas.resume import CandidateWithEvaluationResponse, CandidateResponse, EvaluationResponse
from app.services.job_service import JobService
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def get_job_service(db: Session = Depends(get_db)) -> JobService:
    return JobService(db)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreate, service: JobService = Depends(get_job_service)):
    return service.create_job(job_data)


@router.get("", response_model=List[JobResponse])
def list_jobs(service: JobService = Depends(get_job_service)):
    return service.list_jobs()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, service: JobService = Depends(get_job_service)):
    job = service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found")
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, service: JobService = Depends(get_job_service)):
    deleted = service.delete_job(job_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{job_id}/candidates", response_model=List[CandidateWithEvaluationResponse])
def list_job_candidates(
    job_id: int,
    status: Optional[str] = Query(default=None),
    min_score: Optional[int] = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    job_service = JobService(db)
    if not job_service.get_job(job_id):
        raise HTTPException(status_code=404, detail="Job position not found")

    resume_service = ResumeService(db)
    candidates = resume_service.list_candidates(job_id=job_id, min_score=min_score, status_filter=status)

    return [
        CandidateWithEvaluationResponse(
            candidate=CandidateResponse.model_validate(candidate),
            evaluation=EvaluationResponse.model_validate(candidate.evaluation) if candidate.evaluation else None,
        )
        for candidate in candidates
    ]
