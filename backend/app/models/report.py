from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class ReasonEnum(str, enum.Enum):
    harassment = "harassment"
    self_harm = "self_harm"
    spam = "spam"
    hate_speech = "hate_speech"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"
    dismissed = "dismissed"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reported_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reference_id = Column(Integer, nullable=False)
    reference_type = Column(Enum("post", "comment", name="reference_type_enum"), nullable=False)
    reason = Column(Enum(ReasonEnum), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)