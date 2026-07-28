from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


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
