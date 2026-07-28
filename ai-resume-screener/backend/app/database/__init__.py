from typing import Generator
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.config.settings import settings


class Base(DeclarativeBase):
    pass


# Import model modules so SQLAlchemy relationships resolve correctly.
from app.models.job import Job  # noqa: E402,F401


ENGINE_ARGS = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=ENGINE_ARGS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)

    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())

        if "jobs" in table_names:
            job_columns = {column["name"] for column in inspector.get_columns("jobs")}
            if "required_skills" not in job_columns:
                connection.execute(text("ALTER TABLE jobs ADD COLUMN required_skills TEXT"))
            if "min_experience" not in job_columns:
                connection.execute(text("ALTER TABLE jobs ADD COLUMN min_experience INTEGER"))
            if "created_at" not in job_columns:
                connection.execute(text("ALTER TABLE jobs ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))

            with Session(engine) as session:
                if session.query(Job).count() == 0:
                    session.add(
                        Job(
                            title="Sample Job",
                            description="Backend engineer role",
                            required_skills="Python, FastAPI",
                            min_experience=3,
                        )
                    )
                    session.commit()

        if "candidates" in table_names:
            candidate_columns = {column["name"] for column in inspector.get_columns("candidates")}
            if "resume_text" not in candidate_columns:
                connection.execute(text("ALTER TABLE candidates ADD COLUMN resume_text TEXT"))
            if "experience" not in candidate_columns:
                connection.execute(text("ALTER TABLE candidates ADD COLUMN experience INTEGER"))
            if "created_at" not in candidate_columns:
                connection.execute(text("ALTER TABLE candidates ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))

        if "evaluations" in table_names:
            evaluation_columns = {column["name"] for column in inspector.get_columns("evaluations")}
            if "summary" not in evaluation_columns:
                connection.execute(text("ALTER TABLE evaluations ADD COLUMN summary TEXT"))
            if "recommendation" not in evaluation_columns:
                connection.execute(text("ALTER TABLE evaluations ADD COLUMN recommendation TEXT"))
            if "error" not in evaluation_columns:
                connection.execute(text("ALTER TABLE evaluations ADD COLUMN error TEXT"))
            if "created_at" not in evaluation_columns:
                connection.execute(text("ALTER TABLE evaluations ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_dependency():
    return get_db

