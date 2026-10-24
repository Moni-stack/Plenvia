from pydantic import BaseModel
from datetime import datetime


class StudySessionCreate(BaseModel):
    duration_minutes: int
    started_at: datetime
    completed_at: datetime

    