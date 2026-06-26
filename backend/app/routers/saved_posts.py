from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.saved_post import SavedPost
from app.schemas.saved_post import SavedPostResponse
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/saved", tags=["Saved Posts"])

@router.post("/{post_id}", response_model=SavedPostResponse, status_code=status.HTTP_201_CREATED)
def save_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(SavedPost).filter(SavedPost.user_id == current_user.id, SavedPost.post_id == post_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Post already saved")
    saved = SavedPost(user_id=current_user.id, post_id=post_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@router.get("/", response_model=List[SavedPostResponse])
def get_saved_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SavedPost).filter(SavedPost.user_id == current_user.id).all()

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedPost).filter(SavedPost.user_id == current_user.id, SavedPost.post_id == post_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved post not found")
    db.delete(saved)
    db.commit()