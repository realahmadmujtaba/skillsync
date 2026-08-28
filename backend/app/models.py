from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    student = "student"
    mentor = "mentor"
    admin = "admin"


class Stage(str, enum.Enum):
    applied = "applied"
    screening = "screening"
    interview = "interview"
    offer = "offer"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.student, nullable=False)
    readiness: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    applications: Mapped[list[Application]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    interviews: Mapped[list[InterviewResult]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    company: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(160), nullable=False)
    location: Mapped[str] = mapped_column(String(160), default="")
    tags: Mapped[str] = mapped_column(String(255), default="")  # comma-separated
    match: Mapped[int] = mapped_column(Integer, default=0)
    posted: Mapped[str] = mapped_column(String(40), default="new")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    company: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(160), nullable=False)
    match: Mapped[int] = mapped_column(Integer, default=0)
    stage: Mapped[Stage] = mapped_column(Enum(Stage), default=Stage.applied)

    user: Mapped[User] = relationship(back_populates="applications")


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    track: Mapped[str] = mapped_column(String(40))
    score: Mapped[int] = mapped_column(Integer, default=0)
    feedback: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    user: Mapped[User] = relationship(back_populates="interviews")
