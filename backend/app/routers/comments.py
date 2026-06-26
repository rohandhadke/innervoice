from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse
from app.utils.dependencies import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/posts/{post_id}/comments", tags=["Comments"])

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    comment = Comment(
        post_id=post_id,
        content=data.content,
        is_anonymous=data.is_anonymous,
        parent_comment_id=data.parent_comment_id,
        user_id=current_user.id if current_user and not data.is_anonymous else None
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.is_deleted == False,
        Comment.parent_comment_id.is_(None)      # fix: use is_(None) for NULL check
    ).order_by(Comment.created_at.asc()).all()

@router.get("/{comment_id}/replies", response_model=List[CommentResponse])
def get_replies(post_id: int, comment_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_comment_id == comment_id,
        Comment.is_deleted == False
    ).order_by(Comment.created_at.asc()).all()