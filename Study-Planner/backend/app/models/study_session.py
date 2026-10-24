from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    duration_minutes = Column(Integer, nullable=False)

    started_at = Column(DateTime, nullable=False)

    completed_at = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)