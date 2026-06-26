from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from datetime import datetime
from app.database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    role = Column(Enum("super_admin", "moderator", name="admin_role_enum"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)