"""Seed the database with demo data. Idempotent — safe to run repeatedly."""

from sqlalchemy import select

from .database import Base, SessionLocal, engine
from .models import Application, Opportunity, Role, Stage, User
from .security import hash_password

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
