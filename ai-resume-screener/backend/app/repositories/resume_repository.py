from typing import List, Optional
from sqlalchemy import nulls_last
from sqlalchemy.orm import Session, joinedload
from app.models.resume import Candidate, Evaluation


class ResumeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, job_id: int, name: str, email: Optional[str], resume_text: Optional[str], experience: Optional[int]) -> Candidate:
        candidate = Candidate(
            job_id=job_id,
            name=name,
            email=email,
            resume_text=resume_text,
            experience=experience,
            status="pending",
        )
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def get_by_id(self, resume_id: int) -> Optional[Candidate]:
        return self.db.query(Candidate).filter(Candidate.id == resume_id).first()

    def delete_by_id(self, candidate_id: int) -> bool:
        candidate = self.get_by_id(candidate_id)
        if not candidate:
            return False

        self.db.delete(candidate)
        self.db.commit()
        return True

    def list_for_job(self, job_id: int, min_score: Optional[int], status_filter: Optional[str]) -> List[Candidate]:
        query = (
            self.db.query(Candidate)
            .outerjoin(Evaluation, Candidate.id == Evaluation.candidate_id)
            .options(joinedload(Candidate.evaluation))
            .filter(Candidate.job_id == job_id)
        )

        if status_filter is not None:
            query = query.filter(Candidate.status == status_filter)

        if min_score is not None:
            query = query.filter(Evaluation.match_score >= min_score)

        return query.order_by(nulls_last(Evaluation.match_score.desc()), Candidate.created_at.desc()).all()

    def update_status(self, candidate: Candidate, status: str) -> Candidate:
        candidate.status = status
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def update_evaluation(self, candidate: Candidate, score: int, analysis: dict) -> Candidate:
        candidate.status = "completed" if score >= 60 else "failed"
        evaluation = Evaluation(
            candidate_id=candidate.id,
            match_score=score,
            summary=analysis.get("summary"),
            matched_skills=analysis.get("matched_skills"),
            missing_skills=analysis.get("missing_skills"),
            recommendation=analysis.get("recommendation"),
            error=analysis.get("error"),
        )
        self.db.add(evaluation)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def mark_failed(self, candidate: Candidate, error_message: str) -> Candidate:
        candidate.status = "failed"
        evaluation = Evaluation(candidate_id=candidate.id, error=error_message)
        self.db.add(evaluation)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate
