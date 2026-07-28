from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.resume_repository import ResumeRepository
from app.models.resume import Candidate
from app.services.extractor import TextExtractorService
from app.llm.client import LLMClient


class ResumeService:
    def __init__(self, db: Session):
        self.repository = ResumeRepository(db)
        self.extractor = TextExtractorService()
        self.llm_client = LLMClient()

    def upload_and_evaluate(self, job_id: int, filename: str, file_bytes: bytes) -> Candidate:
        raw_text = self.extractor.extract_text(file_bytes, filename)
        candidate = self.repository.create(job_id=job_id, name=filename, email=None, resume_text=raw_text, experience=None)

        try:
            _, score, analysis = self.llm_client.evaluate_resume(job_id=job_id, resume_text=raw_text)
            return self.repository.update_evaluation(candidate, score, analysis)
        except Exception as exc:  # pragma: no cover - defensive fallback
            return self.repository.mark_failed(candidate, f"Evaluation pipeline error: {str(exc)}")

    def list_candidates(self, job_id: int, min_score: Optional[int], status_filter: Optional[str]) -> list[Candidate]:
        return self.repository.list_for_job(job_id, min_score, status_filter)

    def update_status(self, resume_id: int, status: str) -> Candidate:
        candidate = self.repository.get_by_id(resume_id)
        if not candidate:
            raise ValueError("Candidate record profile not found")
        return self.repository.update_status(candidate, status)

    def delete_candidate(self, candidate_id: int) -> bool:
        return self.repository.delete_by_id(candidate_id)
