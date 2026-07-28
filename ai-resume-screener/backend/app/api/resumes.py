from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.services.extractor import TextExtractorService
from app.services.llm import LLMService

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_screen_resume(
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify Job context exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target job position profile not found")

    # Ingestion phase
    file_bytes = await file.read()
    raw_text = TextExtractorService.extract_text(file_bytes, file.filename)
    
    # Initialize basic transient model tracker state inside database
    db_resume = Resume(
        job_id=job_id,
        filename=file.filename,
        status="processing"
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    try:
        # Core async LLM parsing evaluation 
        candidate_name, score, analysis = await LLMService.evaluate_resume(
            job_title=job.title, 
            job_description=job.description, 
            resume_text=raw_text
        )
        
        # Save evaluation tracking records back down into DB state entries
        db_resume.candidate_name = candidate_name
        db_resume.score = score
        db_resume.analysis = analysis
        db_resume.status = "completed" if score > 0 else "failed"
        
    except Exception as e:
        db_resume.status = "failed"
        db_resume.analysis = {"error": f"Evaluation pipeline error: {str(e)}"}
    
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.get("/job/{job_id}", response_model=List[ResumeResponse])
def get_ranked_candidates(
    job_id: int,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    status_filter: Optional[str] = Query(None), # "processing", "completed", "failed", "shortlisted", "rejected"
    db: Session = Depends(get_db)
):
    query = db.query(Resume).filter(Resume.job_id == job_id)
    
    if min_score is not None:
        query = query.filter(Resume.score >= min_score)
        
    if status_filter is not None:
        query = query.filter(Resume.status == status_filter)
        
    # Rank directly using sorting algorithm based natively on the evaluated metrics logic
    return query.order_by(Resume.score.desc()).all()

@router.patch("/{resume_id}/status", response_model=ResumeResponse)
def update_candidate_status(
    resume_id: int,
    action: str = Query(..., regex="^(shortlisted|rejected|completed)$"),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Candidate record profile not found")
        
    resume.status = action
    db.commit()
    db.refresh(resume)
    return resume
