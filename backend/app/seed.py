"""Seed the database with demo data. Idempotent — safe to run repeatedly."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from .database import Base, SessionLocal, engine
from .models import (
    Application,
    Opportunity,
    ReadinessSnapshot,
    Role,
    SkillAssessment,
    SkillStatus,
    Stage,
    User,
)
from .security import hash_password

DEMO_SKILLS = [
    ("Data Structures & Algorithms", 88, SkillStatus.strong, "Consistent problem-solving; 320+ solved."),
    ("React + TypeScript", 82, SkillStatus.strong, "Two shipped projects with typed contracts."),
    ("Databases", 70, SkillStatus.growing, "Solid schema design; add query optimization depth."),
    ("REST & API design", 66, SkillStatus.growing, "Solid basics; add auth + rate limiting depth."),
    ("System Design", 54, SkillStatus.gap, "No evidence of scalability/architecture work."),
    ("Automated Testing", 45, SkillStatus.gap, "Add unit + one E2E flow to a project."),
]

DEMO_READINESS_TREND = [41, 48, 55, 62, 71, 78]

OPPORTUNITIES = [
    ("Northwind Labs", "Software Engineer Intern", "Bengaluru · Hybrid", "React,TypeScript,Node", 92, "2d ago"),
    ("Helios Systems", "Backend Intern", "Remote", "Node,PostgreSQL,APIs", 84, "4d ago"),
    ("Vantage AI", "ML Platform Intern", "Hyderabad · On-site", "Python,ML,Docker", 71, "1w ago"),
    ("Cobalt Studio", "Frontend Intern", "Remote", "React,Tailwind,UX", 88, "1w ago"),
    ("Meridian Cloud", "Platform Engineer Intern", "Pune · Hybrid", "Kubernetes,CI/CD,Go", 63, "2w ago"),
]


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.scalar(select(Opportunity)):
            for c, r, loc, tags, m, posted in OPPORTUNITIES:
                db.add(Opportunity(company=c, role=r, location=loc, tags=tags, match=m, posted=posted))

        demo = db.scalar(select(User).where(User.email == "student@skillsync.io"))
        if not demo:
            demo = User(
                name="Aarav Menon",
                email="student@skillsync.io",
                hashed_password=hash_password("password123"),
                role=Role.student,
                readiness=78,
            )
            db.add(demo)
            db.flush()
            for c, r, m, s in [
                ("Cobalt Studio", "Frontend Intern", 88, Stage.applied),
                ("Helios Systems", "Backend Intern", 84, Stage.screening),
                ("Northwind Labs", "Software Engineer Intern", 92, Stage.interview),
                ("Lumen Data", "SWE Intern", 79, Stage.offer),
            ]:
                db.add(Application(user_id=demo.id, company=c, role=r, match=m, stage=s))
            for skill, coverage, status, note in DEMO_SKILLS:
                db.add(SkillAssessment(user_id=demo.id, skill=skill, coverage=coverage, status=status, note=note))
            base = datetime.now(timezone.utc) - timedelta(days=30 * (len(DEMO_READINESS_TREND) - 1))
            for i, score in enumerate(DEMO_READINESS_TREND):
                db.add(ReadinessSnapshot(user_id=demo.id, score=score, recorded_at=base + timedelta(days=30 * i)))

        for email, role in [("mentor@skillsync.io", Role.mentor), ("admin@skillsync.io", Role.admin)]:
            if not db.scalar(select(User).where(User.email == email)):
                db.add(User(
                    name=email.split("@")[0].title(),
                    email=email,
                    hashed_password=hash_password("password123"),
                    role=role,
                ))

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
