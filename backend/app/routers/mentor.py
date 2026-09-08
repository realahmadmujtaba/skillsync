from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_role
from ..models import ReadinessSnapshot, Role, SkillAssessment, SkillStatus, User
from ..schemas import MenteeOut

router = APIRouter(prefix="/api/mentor", tags=["mentor"])


@router.get("/mentees", response_model=list[MenteeOut])
def mentees(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.mentor, Role.admin)),
) -> list[MenteeOut]:
    students = db.scalars(select(User).where(User.role == Role.student)).all()

    out: list[MenteeOut] = []
    for s in students:
        history = db.scalars(
            select(ReadinessSnapshot)
            .where(ReadinessSnapshot.user_id == s.id)
            .order_by(ReadinessSnapshot.recorded_at)
        ).all()
        if len(history) >= 2:
            delta = history[-1].score - history[-2].score
            trend = f"{'+' if delta >= 0 else ''}{delta}"
        elif history:
            trend = "New"
        else:
            trend = "—"

        weakest = db.scalar(
            select(SkillAssessment)
            .where(SkillAssessment.user_id == s.id)
            .order_by(SkillAssessment.coverage.asc())
        )
        if not weakest:
            flag = "No resume analyzed yet"
        elif weakest.status == SkillStatus.strong:
            flag = "Interview-ready"
        else:
            flag = f"{weakest.skill} gap"

        out.append(
            MenteeOut(
                id=s.id,
                name=s.name,
                email=s.email,
                target_role=s.target_role,
                readiness=s.readiness,
                trend=trend,
                flag=flag,
            )
        )

    out.sort(key=lambda m: m.readiness)
    return out
