# SkillSync API — FastAPI + PostgreSQL

Backend service for the SkillSync platform: JWT auth with roles, opportunities,
application tracking, and interview results.

## Stack
- **FastAPI** (REST) · **SQLAlchemy 2.0** ORM · **PostgreSQL** · **JWT** (python-jose)
- Passwords hashed with **bcrypt** (passlib)
- Layered: `routers → deps → models/schemas → database`

## Run with Docker (recommended)
From the repo root:
```bash
docker compose up --build
```
This starts Postgres + the API on `http://localhost:8000`, seeds demo data, and
exposes interactive docs at `http://localhost:8000/docs`.

## Run locally without Docker
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # point DATABASE_URL at your Postgres
alembic upgrade head           # apply migrations (creates the schema)
python -m app.seed             # optional: demo data
uvicorn app.main:app --reload --port 8000
```

## Database migrations (Alembic)
The schema is owned by Alembic — not `create_all`. Common commands:
```bash
alembic upgrade head                        # apply all migrations
alembic revision --autogenerate -m "msg"    # create a migration after model changes
alembic downgrade -1                         # roll back one step
```
The Docker image and `docker compose` run `alembic upgrade head` automatically on start.

## Tests
```bash
pip install -r requirements-dev.txt
pytest            # runs against an isolated in-memory SQLite db
ruff check .      # lint
```

## Continuous integration
`.github/workflows/ci.yml` runs on every push/PR: frontend (typecheck + build) and
backend (ruff, `alembic upgrade head` against a real Postgres service, then `pytest`).

## Demo accounts (password: `password123`)
- `student@skillsync.io` · `mentor@skillsync.io` · `admin@skillsync.io`

## Key endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/signup` | Register (returns JWT) |
| POST | `/api/auth/login` | Login (OAuth2 form: `username`=email) |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/opportunities` | List opportunities |
| GET/POST | `/api/applications` | List / create applications |
| PATCH | `/api/applications/{id}` | Move stage |
| GET/POST | `/api/interviews` | List / save results |
| GET | `/api/health` | Health check |

## Connect the frontend
Set `VITE_API_URL=http://localhost:8000` in a root `.env`. The frontend auto-detects
the API and falls back to local mode when it's unreachable.
