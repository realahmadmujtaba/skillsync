from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Application, ReadinessSnapshot, SkillAssessment, Stage, User
from ..schemas import DashboardOut, FunnelStage, ReadinessPoint, SkillOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> DashboardOut:
    skills = db.scalars(
        select(SkillAssessment).where(SkillAssessment.user_id == user.id)
    ).all()
    skill_out = [
        SkillOut(skill=s.skill, coverage=s.coverage, status=s.status, note=s.note)
        for s in skills
    ]

    history = db.scalars(
        select(ReadinessSnapshot)
        .where(ReadinessSnapshot.user_id == user.id)
        .order_by(ReadinessSnapshot.recorded_at)
    ).all()
    trend = [
        ReadinessPoint(date=h.recorded_at.strftime("%b %d"), score=h.score)
        for h in history[-8:]
    ]
    delta = trend[-1].score - trend[0].score if len(trend) >= 2 else 0

    counts_raw = db.execute(
        select(Application.stage, func.count())
        .where(Application.user_id == user.id)
        .group_by(Application.stage)
    ).all()
    counts = {stage.value: cnt for stage, cnt in counts_raw}
    funnel = [
        FunnelStage(stage=stage.value.capitalize(), value=counts.get(stage.value, 0))
        for stage in Stage
    ]

    top_gaps = sorted(
        (s for s in skill_out if s.status != "strong"), key=lambda s: s.coverage
    )[:3]

    return DashboardOut(
        name=user.name,
        target_role=user.target_role,
        readiness=user.readiness,
        readiness_delta=delta,
        readiness_trend=trend,
        skill_coverage=skill_out,
        funnel=funnel,
        top_gaps=top_gaps,
    )
