from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.task import Task
from app.schemas.task_schema import TaskCreate, TaskUpdate
from app.utils.security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Create tasks
@router.post("/tasks")
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    new_task = Task(
        user_id=user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        deadline=task.deadline
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

#Get All Tasks
@router.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    tasks = db.query(Task).filter(Task.user_id == user_id).all()

    return tasks

#Update tasks
@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id,
    ).first()

    if not db_task:
        return {"error": "Task not found"}

    updates = task.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(db_task, key, value)

    # Record the actual time when the task is completed
    if updates.get("status") == "completed":
        db_task.completed_at = datetime.utcnow()

    # Clear completion time if the task is marked pending again
    elif updates.get("status") == "pending":
        db_task.completed_at = None

    db.commit()
    db.refresh(db_task)

    return db_task

#Delete Tasks
@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id,
    ).first()

    if not task:
        return {"error": "Task not found"}

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}