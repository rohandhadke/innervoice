from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.post import Post
from app.models.post_tag import PostTag
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.utils.dependencies import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(data: PostCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    post = Post(
        content=data.content,
        is_anonymous=data.is_anonymous,
        mood=data.mood,
        visibility=data.visibility,
        user_id=current_user.id if current_user and not data.is_anonymous else None
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    for tag_id in data.tag_ids:
        db.add(PostTag(post_id=post.id, tag_id=tag_id))
    db.commit()
    return post

@router.get("/", response_model=List[PostResponse])
def get_all_posts(skip: int = 0, limit: int = 20, mood: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Post).filter(Post.is_deleted == False, Post.visibility == "public")
    if mood:
        query = query.filter(Post.mood == mood)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, data: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not authorized")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not authorized")
    post.is_deleted = True
    db.commit()