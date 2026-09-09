import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..email import send_email
from ..models import PasswordResetToken, User
from ..schemas import (
    ForgotPasswordIn,
    GoogleAuthIn,
    ResetPasswordIn,
    Token,
    UserCreate,
    UserOut,
)
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)

RESET_TOKEN_TTL_MINUTES = 30


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@router.post("/signup", response_model=Token, status_code=201)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    exists = db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    # OAuth2 form uses `username` for the email field.
    user = db.scalar(select(User).where(User.email == form.username))
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/forgot-password", status_code=202)
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user:
        raw_token = secrets.token_urlsafe(32)
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=_hash_token(raw_token),
                expires_at=_utcnow_naive() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES),
            )
        )
        db.commit()
        reset_link = f"{settings.frontend_url.rstrip('/')}/?reset_token={raw_token}"
        try:
            send_email(
                to=user.email,
                subject="Reset your SkillSync password",
                html=(
                    f"<p>Hi {user.name},</p>"
                    f"<p>Click the link below to reset your SkillSync password. "
                    f"This link expires in {RESET_TOKEN_TTL_MINUTES} minutes.</p>"
                    f'<p><a href="{reset_link}">{reset_link}</a></p>'
                    "<p>If you didn't request this, you can safely ignore this email.</p>"
                ),
            )
        except Exception:
            # Never leak email-delivery failures through this endpoint's
            # response, but do log them — otherwise a broken SMTP config
            # fails silently forever.
            logger.exception("Failed to send password-reset email to %s", user.email)
    # Always the same response, regardless of whether the email is registered.
    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)) -> dict:
    token_hash = _hash_token(payload.token)
    record = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    if not record or record.used or record.expires_at < _utcnow_naive():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user = db.get(User, record.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user.hashed_password = hash_password(payload.new_password)
    record.used = True
    db.commit()
    return {"detail": "Password updated. You can now log in."}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/google", response_model=Token)
def google_login(payload: GoogleAuthIn, db: Session = Depends(get_db)) -> Token:
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.google_client_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid Google token") from exc

    sub = claims["sub"]
    email = claims["email"]
    name = claims.get("name") or email.split("@")[0]

    user = db.scalar(select(User).where(User.google_sub == sub))
    if not user:
        user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(name=name, email=email, google_sub=sub, role=payload.role)
        db.add(user)
    elif not user.google_sub:
        user.google_sub = sub
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))
