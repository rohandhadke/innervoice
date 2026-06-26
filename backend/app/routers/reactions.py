from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.reaction import Reaction
from app.schemas.reaction import ReactionCreate, ReactionResponse
from app.utils.dependencies import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/posts/{post_id}/reactions", tags=["Reactions"])

@router.post("/", response_model=ReactionResponse, status_code=status.HTTP_201_CREATED)
def add_reaction(post_id: int, data: ReactionCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    reaction = Reaction(
        post_id=post_id,
        reaction_type=data.reaction_type,
        user_id=current_user.id if current_user else None
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction