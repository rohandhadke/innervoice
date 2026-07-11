from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuthorResponse(BaseModel):
    username: str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

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
    author: Optional[AuthorResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True