from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.mood_log import MoodEnum

class MoodLogCreate(BaseModel):
    mood: MoodEnum
    note: Optional[str] = None

class MoodLogResponse(BaseModel):
    id: int
    mood: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True