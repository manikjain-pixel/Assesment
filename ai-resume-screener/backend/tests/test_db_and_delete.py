from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import BASE_DIR, Settings
from app.database import Base
from app.models.job import Job
from app.models.resume import Candidate, Evaluation
from app.repositories.job_repository import JobRepository
from app.repositories.resume_repository import ResumeRepository


def test_database_url_is_relative_to_backend_directory():
    settings = Settings()
    expected = (BASE_DIR / "ai_screener.db").resolve()
    assert settings.DATABASE_URL == f"sqlite:///{expected}"


def test_job_and_candidate_deletion_removes_related_rows():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        job_repo = JobRepository(session)
        resume_repo = ResumeRepository(session)

        job = job_repo.create(
            type(
                "JobData",
                (),
                {
                    "title": "Senior Frontend Engineer",
                    "description": "Build web apps",
                    "required_skills": "react, angular",
                    "min_experience": 3,
                },
            )()
        )

        candidate = resume_repo.create(job_id=job.id, name="Test Candidate", email=None, resume_text="React Angular", experience=3)
        session.add(Evaluation(candidate_id=candidate.id, match_score=80, summary="Strong fit", matched_skills=["react"], missing_skills=[], recommendation="strong"))
        session.commit()

        job_repo.delete_job(job.id)

        assert session.query(Job).filter(Job.id == job.id).count() == 0
        assert session.query(Candidate).filter(Candidate.job_id == job.id).count() == 0
        assert session.query(Evaluation).filter(Evaluation.candidate_id == candidate.id).count() == 0
