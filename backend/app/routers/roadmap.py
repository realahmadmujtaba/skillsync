from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import SkillAssessment, SkillStatus, User
from ..resources import resources_for
from ..schemas import ResourceLink, RoadmapMilestone, RoadmapOut

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

TITLE_VERB = {
    SkillStatus.gap: "Close the gap in",
    SkillStatus.growing: "Deepen",
    SkillStatus.strong: "Maintain",
}


@router.get("", response_model=RoadmapOut)
def get_roadmap(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> RoadmapOut:
    skills = db.scalars(
        select(SkillAssessment)
        .where(SkillAssessment.user_id == user.id)
        .order_by(SkillAssessment.coverage.asc())
    ).all()

    milestones: list[RoadmapMilestone] = []
    active_assigned = False
    for s in skills:
        if s.status == SkillStatus.strong:
            status = "done"
            progress = 100
        elif not active_assigned:
            status = "active"
            progress = s.coverage
            active_assigned = True
        else:
            status = "upcoming"
            progress = 0

        resources = (
            [ResourceLink(**r) for r in resources_for(s.skill)]
            if s.status != SkillStatus.strong
            else []
        )
        milestones.append(
            RoadmapMilestone(
                skill=s.skill,
                title=f"{TITLE_VERB[s.status]} {s.skill}",
                focus=s.note,
                status=status,
                progress=progress,
                resources=resources,
            )
        )

    return RoadmapOut(milestones=milestones)
