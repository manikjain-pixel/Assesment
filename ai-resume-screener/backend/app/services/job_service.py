from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.job_repository import JobRepository
from app.models.job import Job
from app.schemas.job import JobCreate


class JobService:
    def __init__(self, db: Session):
        self.repository = JobRepository(db)

    def create_job(self, job_data: JobCreate) -> Job:
        return self.repository.create(job_data)

    def list_jobs(self) -> List[Job]:
        return self.repository.list_all()

    def get_job(self, job_id: int) -> Optional[Job]:
        return self.repository.get_by_id(job_id)

    def delete_job(self, job_id: int) -> bool:
        return self.repository.delete_by_id(job_id)
