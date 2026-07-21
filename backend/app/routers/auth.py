from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, OTPRequest, OTPVerify
from app.utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.email import send_email
import random

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=TokenResponse)
def refresh(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(data: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    # generate 6 digit OTP
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # save OTP and expiry to user record
    user.email_otp = otp
    user.email_otp_expires_at = expires_at
    db.commit()

    # send OTP email via SMTP
    try:
        send_email(
            to=user.email,
            subject="InnerVoice — Email Verification OTP",
            html_body=f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #7c3aed;">Verify your InnerVoice email</h2>
                    <p>Hi {user.full_name or user.username},</p>
                    <p>Your OTP for email verification is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; margin: 24px 0;">
                        {otp}
                    </div>
                    <p>This OTP expires in <strong>10 minutes</strong>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p style="color: #888; font-size: 12px; margin-top: 32px;">— The InnerVoice Team</p>
                </div>
            """
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")

    return {"message": "OTP sent successfully. Please check your email."}

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")
    if not user.email_otp or not user.email_otp_expires_at:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")

    # check expiry (strip tzinfo — MySQL returns naive datetimes)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if now > user.email_otp_expires_at:
        user.email_otp = None
        user.email_otp_expires_at = None
        db.commit()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # check OTP value
    if data.otp != user.email_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    # mark verified and clear OTP
    user.is_verified = True
    user.email_otp = None
    user.email_otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully."}
