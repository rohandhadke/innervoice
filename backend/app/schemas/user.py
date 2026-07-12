from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from app.models.user import GenderEnum

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    phone_number: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PublicUserResponse(BaseModel):
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"