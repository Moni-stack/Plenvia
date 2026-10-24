from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, tasks, study_sessions
from app.models.study_session import StudySession

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])
app.include_router(
    study_sessions.router,
    tags=["Study Sessions"]
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for now (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
