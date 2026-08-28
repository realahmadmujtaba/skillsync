from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import Role, Stage


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Role = Role.student


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    readiness: int


class OpportunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company: str
    role: str
    location: str
    tags: list[str]
    match: int
    posted: str

    @classmethod
    def from_model(cls, o) -> "OpportunityOut":
        return cls(
            id=o.id,
            company=o.company,
            role=o.role,
            location=o.location,
            tags=[t for t in o.tags.split(",") if t],
            match=o.match,
            posted=o.posted,
        )


class ApplicationCreate(BaseModel):
    company: str
    role: str
    match: int = 0
    stage: Stage = Stage.applied


class ApplicationUpdate(BaseModel):
    stage: Stage


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company: str
    role: str
    match: int
    stage: Stage


class InterviewCreate(BaseModel):
    track: str
    score: int
    feedback: str = ""


class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    track: str
    score: int
    feedback: str
    created_at: datetime
