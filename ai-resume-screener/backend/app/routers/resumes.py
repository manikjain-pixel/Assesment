import re
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.resume import CandidateResponse
from app.services.job_service import JobService
from app.services.resume_parser import ResumeParserService
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


def get_resume_service(db: Session = Depends(get_db)) -> ResumeService:
    return ResumeService(db)


@router.post("/jobs/{job_id}/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    job_id: int,
    resume: UploadFile = File(...),
    service: ResumeService = Depends(get_resume_service),
):
    job_service = JobService(service.repository.db)
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if not resume.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file")

    filename = resume.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".txt")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file")

    parser = ResumeParserService()
    try:
        raw_text = parser.extract_text(file_bytes, resume.filename)
    except HTTPException as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.detail) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file") from exc

    candidate_name = parser.extract_name(raw_text) or "Unknown"
    email = parser.extract_email(raw_text)

    try:
        candidate = service.repository.create(
            job_id=job_id,
            name=candidate_name,
            email=email,
            resume_text=raw_text,
            experience=None,
        )
        job_description = job.description if job else ""
        required_skills = job.required_skills if job else ""
        evaluation = await service.llm_client.evaluate_resume(
            job_description=job_description,
            required_skills=required_skills,
            resume_text=raw_text,
        )
        service.repository.update_evaluation(
            candidate,
            evaluation.get("match_score", 0),
            {
                "summary": evaluation.get("summary", ""),
                "matched_skills": evaluation.get("matched_skills", []),
                "missing_skills": evaluation.get("missing_skills", []),
                "recommendation": evaluation.get("recommendation", ""),
            },
        )
        return candidate
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Evaluation failed") from exc


@router.get("/job/{job_id}", response_model=List[CandidateResponse])
def list_candidates(
    job_id: int,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    return service.list_candidates(job_id, min_score, status_filter)


@router.patch("/{resume_id}/status", response_model=CandidateResponse)
def update_candidate_status(
    resume_id: int,
    action: str = Query(..., regex="^(shortlisted|rejected|completed)$"),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    try:
        return service.update_status(resume_id, action)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
