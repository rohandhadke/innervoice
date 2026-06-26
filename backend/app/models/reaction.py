from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class ReactionTypeEnum(str, enum.Enum):
    heart = "heart"
    hug = "hug"
    relate = "relate"
    strong = "strong"
    sad = "sad"

class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reaction_type = Column(Enum(ReactionTypeEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")