from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.post import Post
from app.schemas.user import UserResponse, UserUpdate, PublicUserResponse
from app.schemas.post import PostResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/posts", response_model=List[PostResponse])
def get_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.routers.posts import build_post_response
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.is_deleted == False
        # no visibility filter — returns both public and private posts
        # no is_anonymous filter — returns both anonymous and identity posts
    ).order_by(Post.created_at.desc()).all()
    return [build_post_response(post, db) for post in posts]


@router.get("/{username}", response_model=PublicUserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == username,
        User.is_active == True
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{username}/posts", response_model=List[PostResponse])
def get_user_posts(username: str, db: Session = Depends(get_db)):
    from app.routers.posts import build_post_response
    user = db.query(User).filter(
        User.username == username,
        User.is_active == True
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # public profile — only show public non-anonymous posts
    posts = db.query(Post).filter(
        Post.user_id == user.id,
        Post.is_anonymous == False,
        Post.is_deleted == False,
        Post.visibility == "public"
    ).order_by(Post.created_at.desc()).all()
    return [build_post_response(post, db) for post in posts]