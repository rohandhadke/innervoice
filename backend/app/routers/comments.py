from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse, AuthorResponse
from app.utils.dependencies import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/posts/{post_id}/comments", tags=["Comments"])

def build_comment_response(comment: Comment, db: Session) -> dict:
    # only attach author if comment is not anonymous and user_id exists
    author = None
    if not comment.is_anonymous and comment.user_id:
        user = db.query(User).filter(User.id == comment.user_id).first()
        if user:
            author = AuthorResponse(
                username=user.username,
                profile_picture_url=user.profile_picture_url
            )

    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "parent_comment_id": comment.parent_comment_id,
        "content": comment.content,
        "is_anonymous": comment.is_anonymous,
        "author": author,
        "created_at": comment.created_at,
    }

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # if user is not logged in — force anonymous regardless of what frontend sends
    if not current_user:
        is_anonymous = True
        user_id = None
    else:
        is_anonymous = data.is_anonymous
        user_id = current_user.id if not data.is_anonymous else None

    comment = Comment(
        post_id=post_id,
        content=data.content,
        is_anonymous=is_anonymous,
        parent_comment_id=data.parent_comment_id,
        user_id=user_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return build_comment_response(comment, db)

@router.get("/", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.is_deleted == False,
        Comment.parent_comment_id.is_(None)
    ).order_by(Comment.created_at.asc()).all()
    return [build_comment_response(comment, db) for comment in comments]

@router.get("/{comment_id}/replies", response_model=List[CommentResponse])
def get_replies(post_id: int, comment_id: int, db: Session = Depends(get_db)):
    replies = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_comment_id == comment_id,
        Comment.is_deleted == False
    ).order_by(Comment.created_at.asc()).all()
    return [build_comment_response(reply, db) for reply in replies]