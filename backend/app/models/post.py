from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class VisibilityEnum(str, enum.Enum):
    public = "public"
    private = "private"

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    mood = Column(String(50), nullable=True)
    visibility = Column(Enum(VisibilityEnum), default=VisibilityEnum.public)
    is_flagged = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    reactions = relationship("Reaction", back_populates="post")
    saved_by = relationship("SavedPost", back_populates="post")
    tags = relationship("PostTag", back_populates="post")