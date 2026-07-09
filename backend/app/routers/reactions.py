from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.reaction import Reaction
from app.schemas.reaction import ReactionCreate, ReactionResponse
from app.utils.dependencies import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/posts/{post_id}/reactions", tags=["Reactions"])

@router.post("/", response_model=ReactionResponse, status_code=status.HTTP_201_CREATED)
def add_reaction(
    post_id: int,
    data: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # for logged-in users check if they already reacted to this post
    if current_user:
        existing = db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.user_id == current_user.id
        ).first()

        if existing:
            # if same reaction type — remove it (toggle off)
            if existing.reaction_type == data.reaction_type:
                db.delete(existing)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_200_OK,
                    detail="Reaction removed"
                )
            # if different reaction type — switch it
            existing.reaction_type = data.reaction_type
            db.commit()
            db.refresh(existing)
            return existing

    # for anonymous users or new reactions from logged-in users
    reaction = Reaction(
        post_id=post_id,
        reaction_type=data.reaction_type,
        user_id=current_user.id if current_user else None
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction