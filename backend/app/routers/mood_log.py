from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.mood_log import MoodLog
from app.schemas.mood_log import MoodLogCreate, MoodLogResponse
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/mood", tags=["MoodLog"])

@router.post("/", response_model=MoodLogResponse)
def log_mood(data: MoodLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log = MoodLog(user_id=current_user.id, mood=data.mood, note=data.note)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/", response_model=List[MoodLogResponse])
def get_my_mood_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MoodLog).filter(MoodLog.user_id == current_user.id).order_by(MoodLog.created_at.desc()).all()