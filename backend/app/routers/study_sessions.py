from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from datetime import date, timedelta
from app.models.task import Task

from app.database import SessionLocal
from app.models.study_session import StudySession
from app.schemas.study_session_schema import StudySessionCreate
from app.utils.security import get_current_user


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create a study session
@router.post("/study-sessions")
def create_study_session(
    session: StudySessionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    new_session = StudySession(
        user_id=user_id,
        duration_minutes=session.duration_minutes,
        started_at=session.started_at,
        completed_at=session.completed_at
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session

from datetime import date
from sqlalchemy import func

@router.get("/study-sessions/today")
def get_today_study_sessions(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    today = date.today()

    total_minutes = (
        db.query(func.sum(StudySession.duration_minutes))
        .filter(
            StudySession.user_id == user_id,
            func.date(StudySession.completed_at) == today
        )
        .scalar()
    )

    sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == user_id,
            func.date(StudySession.completed_at) == today
        )
        .count()
    )

    return {
        "total_minutes": total_minutes or 0,
        "sessions": sessions
    }

@router.get("/streak")
def get_current_streak(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    # Get completed task dates
    completed_tasks = (
        db.query(Task.completed_at)
        .filter(
            Task.user_id == user_id,
            Task.status == "completed",
            Task.completed_at.isnot(None)
        )
        .all()
    )

    # Get completed Pomodoro session dates
    completed_sessions = (
        db.query(StudySession.completed_at)
        .filter(
            StudySession.user_id == user_id
        )
        .all()
    )

    # Combine task + Pomodoro dates
    active_dates = set()

    for task in completed_tasks:
        if task.completed_at:
            active_dates.add(task.completed_at.date())

    for session in completed_sessions:
        if session.completed_at:
            active_dates.add(session.completed_at.date())

    # Calculate current streak
    today = date.today()
    current_streak = 0
    check_date = today

    while check_date in active_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    return {
        "current_streak": current_streak
    }

