from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)
    min_experience = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10)
    required_skills: Optional[str] = None
    min_experience: Optional[int] = Field(default=None, ge=0)


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    required_skills: Optional[str] = None
    min_experience: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)