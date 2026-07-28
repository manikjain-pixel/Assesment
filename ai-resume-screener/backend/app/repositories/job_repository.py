from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.job import Job
from app.schemas.job import JobCreate


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, job_data: JobCreate) -> Job:
        job = Job(
            title=job_data.title,
            description=job_data.description,
            required_skills=job_data.required_skills,
            min_experience=job_data.min_experience,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def list_all(self) -> List[Job]:
        return self.db.query(Job).order_by(Job.created_at.desc()).all()

    def get_by_id(self, job_id: int) -> Optional[Job]:
        return self.db.query(Job).filter(Job.id == job_id).first()

    def delete_by_id(self, job_id: int) -> bool:
        job = self.get_by_id(job_id)
        if not job:
            return False

        self.db.delete(job)
        self.db.commit()
        return True

    def delete_job(self, job_id: int) -> bool:
        return self.delete_by_id(job_id)
