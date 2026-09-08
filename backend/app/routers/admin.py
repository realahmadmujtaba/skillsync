from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_role
from ..models import Application, ReadinessSnapshot, Role, User
from ..schemas import AdminOverviewOut, AdminUserOut, WeeklySignups

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/overview", response_model=AdminOverviewOut)
def overview(
    db: Session = Depends(get_db), _: User = Depends(require_role(Role.admin))
) -> AdminOverviewOut:
    role_counts_raw = db.execute(select(User.role, func.count()).group_by(User.role)).all()
    role_counts = {role.value: count for role, count in role_counts_raw}

    total_applications = db.scalar(select(func.count()).select_from(Application)) or 0
    resumes_analyzed = (
        db.scalar(select(func.count(func.distinct(ReadinessSnapshot.user_id)))) or 0
    )

    now = datetime.now(timezone.utc)
    weekly: list[WeeklySignups] = []
    for i in range(5, -1, -1):
        start = now - timedelta(weeks=i + 1)
        end = now - timedelta(weeks=i)
        count = (
            db.scalar(
                select(func.count()).where(
                    User.created_at >= start, User.created_at < end
                )
            )
            or 0
        )
        weekly.append(WeeklySignups(week=f"W{6 - i}", users=count))

    return AdminOverviewOut(
        total_users=sum(role_counts.values()),
        student_count=role_counts.get("student", 0),
        mentor_count=role_counts.get("mentor", 0),
        admin_count=role_counts.get("admin", 0),
        total_applications=total_applications,
        resumes_analyzed=resumes_analyzed,
        weekly_signups=weekly,
    )


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    db: Session = Depends(get_db), _: User = Depends(require_role(Role.admin))
) -> list[AdminUserOut]:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [
        AdminUserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            readiness=u.readiness,
            joined=u.created_at.strftime("%b %d"),
        )
        for u in users
    ]
