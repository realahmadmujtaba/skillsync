from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import SkillAssessment, SkillStatus, User
from ..resources import resources_for
from ..roadmap_taxonomy import taxonomy_for
from ..schemas import ResourceLink, RoadmapMilestone, RoadmapOut

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

TITLE_VERB = {
    SkillStatus.gap: "Close the gap in",
    SkillStatus.growing: "Deepen",
    SkillStatus.strong: "Maintain",
}


def _starter_roadmap(target_role: str) -> RoadmapOut:
    """No resume analyzed yet — if the target role matches a known roadmap.sh
    taxonomy, give the student a real starting curriculum immediately instead
    of an empty page."""
    taxonomy = taxonomy_for(target_role)
    if not taxonomy:
        return RoadmapOut(milestones=[])

    milestones = [
        RoadmapMilestone(
            skill=topic,
            title=f"Learn {topic}",
            focus=f"Core topic for {target_role}, from {taxonomy['roadmap_label']}.",
            status="active" if i == 0 else "upcoming",
            progress=0,
            resources=[ResourceLink(**r) for r in resources_for(topic, target_role)],
        )
        for i, topic in enumerate(taxonomy["topics"])
    ]
    return RoadmapOut(milestones=milestones)


@router.get("", response_model=RoadmapOut)
def get_roadmap(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> RoadmapOut:
    skills = db.scalars(
        select(SkillAssessment)
        .where(SkillAssessment.user_id == user.id)
        .order_by(SkillAssessment.coverage.asc())
    ).all()

    if not skills:
        return _starter_roadmap(user.target_role)

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
            [ResourceLink(**r) for r in resources_for(s.skill, user.target_role)]
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
