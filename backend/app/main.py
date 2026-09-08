from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .config import settings
from .routers import applications, auth, dashboard, interviews, opportunities, resume, roadmap

# Schema is owned by Alembic migrations (`alembic upgrade head`), run at deploy
# time — see Dockerfile / docker-compose / DEPLOYMENT.md.
app = FastAPI(title="SkillSync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(applications.router)
app.include_router(interviews.router)
app.include_router(resume.router)
app.include_router(dashboard.router)
app.include_router(roadmap.router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "skillsync"}


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")
