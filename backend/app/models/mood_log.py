from sqlalchemy import Column, Integer, ForeignKey, Enum, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class MoodEnum(str, enum.Enum):
    happy = "happy"
    sad = "sad"
    anxious = "anxious"
    angry = "angry"
    confused = "confused"
    grateful = "grateful"
    lost = "lost"
    hopeful = "hopeful"
    numb = "numb"
    exhausted = "exhausted"

class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(Enum(MoodEnum), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="mood_logs")