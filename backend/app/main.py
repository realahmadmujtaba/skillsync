from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import applications, auth, interviews, opportunities

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


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "skillsync"}
