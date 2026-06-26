from pydantic import BaseModel
from app.models.reaction import ReactionTypeEnum
from datetime import datetime

class ReactionCreate(BaseModel):
    reaction_type: ReactionTypeEnum

class ReactionResponse(BaseModel):
    id: int
    post_id: int
    user_id: int | None
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True