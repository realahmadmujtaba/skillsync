from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import Role, SkillStatus, Stage


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
    target_role: str


class GoogleAuthIn(BaseModel):
    id_token: str
    role: Role = Role.student


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


# --- Resume analysis / dashboard / roadmap -------------------------------


class ExtractedSkill(BaseModel):
    """One skill as extracted by Claude from a resume, relative to the target role."""

    skill: str
    coverage: int
    status: Literal["strong", "growing", "gap"]
    note: str


class ResumeExtraction(BaseModel):
    """Structured output schema Claude fills in from the resume PDF."""

    skills: list[ExtractedSkill]
    recommendation: str


class SkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skill: str
    coverage: int
    status: SkillStatus
    note: str


class ResumeAnalysisOut(BaseModel):
    target_role: str
    readiness: int
    recommendation: str
    skills: list[SkillOut]


class ReadinessPoint(BaseModel):
    date: str
    score: int


class FunnelStage(BaseModel):
    stage: str
    value: int


class DashboardOut(BaseModel):
    name: str
    target_role: str
    readiness: int
    readiness_delta: int
    readiness_trend: list[ReadinessPoint]
    skill_coverage: list[SkillOut]
    funnel: list[FunnelStage]
    top_gaps: list[SkillOut]


class RoadmapMilestone(BaseModel):
    skill: str
    title: str
    focus: str
    status: Literal["done", "active", "upcoming"]
    progress: int


class RoadmapOut(BaseModel):
    milestones: list[RoadmapMilestone]
