from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.resume import CandidateResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/candidates", tags=["Candidates"])


class CandidateStatusUpdate(BaseModel):
    status: Literal["new", "shortlisted", "rejected"] = Field(...)


@router.patch("/{candidate_id}", response_model=CandidateResponse)
def update_candidate_status(candidate_id: int, payload: CandidateStatusUpdate, db: Session = Depends(get_db)):
    service = ResumeService(db)
    candidate = service.repository.get_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    updated_candidate = service.repository.update_status(candidate, payload.status)
    return updated_candidate


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    service = ResumeService(db)
    deleted = service.delete_candidate(candidate_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
