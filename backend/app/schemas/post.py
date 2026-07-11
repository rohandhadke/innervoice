from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from app.models.post import VisibilityEnum

class AuthorResponse(BaseModel):
    username: str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

class ReactionSummary(BaseModel):
    id: int
    user_id: Optional[int]
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True

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
    author: Optional[AuthorResponse] = None
    mood: Optional[str]
    visibility: str
    is_flagged: bool
    created_at: datetime
    reactions: Optional[List[ReactionSummary]] = []
    reaction_counts: Optional[Dict[str, int]] = {}
    total_reactions: Optional[int] = 0
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True

class PostUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None