from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from app.models.post import VisibilityEnum

class PostCreate(BaseModel):
    content: str
    is_anonymous: bool = True
    mood: Optional[str] = None
    visibility: VisibilityEnum = VisibilityEnum.public
    tag_ids: Optional[List[int]] = []

class PostResponse(BaseModel):
    id: int
    content: str
    is_anonymous: bool
    user_id: Optional[int]
    mood: Optional[str]
    visibility: str
    is_flagged: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PostUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None