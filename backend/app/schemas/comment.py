from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    content: str
    is_anonymous: bool = False
    parent_comment_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: Optional[int]
    parent_comment_id: Optional[int]
    content: str
    is_anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True