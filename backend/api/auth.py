"""
Module 1: User Authentication
Endpoints: /auth/register, /auth/login, /auth/me
"""

from datetime import datetime, timezone, timedelta
import uuid
import smtplib
from config import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from database.db import users_collection
from models.schemas import UserRegister, UserLogin, UserOut, Token, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
from api.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = await users_collection.find_one({"_id": payload.get("sub")})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    await users_collection.insert_one(user_doc)

    token = create_access_token({"sub": user_id})
    user_out = UserOut(id=user_id, name=payload.name, email=payload.email, created_at=user_doc["created_at"])
    return Token(access_token=token, user=user_out)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    token = create_access_token({"sub": user["_id"]})
    user_out = UserOut(id=user["_id"], name=user["name"], email=user["email"], created_at=user["created_at"])
    return Token(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"],
    )


@router.patch("/me", response_model=UserOut)
async def update_me(payload: UserUpdate, current_user: dict = Depends(get_current_user)):
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"name": payload.name}},
    )
    return UserOut(
        id=current_user["_id"],
        name=payload.name,
        email=current_user["email"],
        created_at=current_user["created_at"],
    )


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        # Don't reveal whether the email exists
        return {"status": "if_exists_email_sent"}

    reset_token = create_access_token({"sub": user["_id"], "purpose": "reset"}, expires_minutes=30)

    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset your TechMart Support password"
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = payload.email

        html_body = f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Reset your password</h2>
                <p>We received a request to reset your TechMart Support password. This link expires in 30 minutes.</p>
                <a href="{reset_link}" style="display:inline-block; background:#2F6F5E; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin:16px 0;">Reset Password</a>
                <p style="color:#888; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_APP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, payload.email, msg.as_string())
    except Exception as e:
        print(f"Failed to send reset email: {e}")

    return {"status": "if_exists_email_sent"}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token_data = decode_access_token(payload.token)
    if not token_data or token_data.get("purpose") != "reset":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user_id = token_data.get("sub")
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    new_hash = hash_password(payload.new_password)
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"password_hash": new_hash}},
    )
    return {"status": "password_reset"}