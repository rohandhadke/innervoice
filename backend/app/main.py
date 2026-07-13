from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.routers import (
    auth,
    users,
    posts,
    comments,
    reactions,
    mood_log,
    reports,
    saved_posts,
    tags,
)
security = HTTPBearer()
app = FastAPI(
    title="InnerVoice API",
    description="Backend API for InnerVoice — Anonymous Thoughts & Feelings Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://innervoice.vercel.app" 
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(mood_log.router)
app.include_router(reports.router)
app.include_router(saved_posts.router)
app.include_router(tags.router)

@app.get("/")
def root():
    return {"message": "InnerVoice API is running"}