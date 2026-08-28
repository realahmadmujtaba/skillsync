# SkillSync

**An AI-assisted internship-readiness platform** — resume gap analysis, a personalized
learning roadmap, mock interviews with instant feedback, an application tracker, and
role-based dashboards for students, mentors, and admins.

**Live demo:** [skillsync-smoky-nine.vercel.app](https://skillsync-smoky-nine.vercel.app)
**API:** _deploying — link goes here once Railway finishes (see [DEPLOYMENT.md](DEPLOYMENT.md))_

![Dashboard](docs/screenshots/dashboard.jpg)

## Why this exists

Final-year students rarely fail interviews for lack of effort — they fail for lack of
*signal*: no clear view of which skills are actually missing for the role they want, no
structured plan to close the gap, and no low-stakes way to rehearse before the real thing.
SkillSync turns that into one loop: **see the gap → follow a roadmap → practice → apply →
track outcomes.**

## Features

| Area | What it does |
|---|---|
| **Auth & RBAC** | Real signup/login (JWT), three roles — Student, Mentor, Admin — each with a purpose-built view |
| **Resume analysis** | Skill-coverage radar + gap analysis against a target role |
| **Learning roadmap** | Milestone timeline generated from the gap analysis |
| **Mock interviews** | Timed sessions across 4 tracks (Behavioral, DSA, System Design, Frontend) with a keyword/structure-based scoring engine and per-answer feedback |
| **Opportunities** | Filterable internship board matched by skill overlap |
| **Applications** | Drag-and-drop Kanban (Applied → Screening → Interview → Offer), backed by real API calls |
| **Mentor / Admin dashboards** | Mentee progress tracking and platform-wide analytics |

<table>
<tr>
<td><img src="docs/screenshots/login.jpg" alt="Login" width="400"></td>
<td><img src="docs/screenshots/opportunities.jpg" alt="Opportunities" width="400"></td>
</tr>
<tr>
<td><img src="docs/screenshots/applications.jpg" alt="Applications kanban" width="400"></td>
<td><img src="docs/screenshots/mock-interview.jpg" alt="Mock interview" width="400"></td>
</tr>
</table>

## Architecture

```
┌──────────────┐        HTTPS         ┌──────────────────┐        SQL         ┌──────────────────┐
│   Vercel     │ ───────────────────> │     Railway       │ ─────────────────> │     Supabase      │
│  React+Vite  │   VITE_API_URL       │  FastAPI (Docker)  │   psycopg 3 +      │    PostgreSQL     │
│  (static)    │ <─────────────────── │  JWT auth + RBAC   │   Session pooler   │  (RLS: locked to  │
└──────────────┘   JSON / REST        └──────────────────┘ <───────────────── │  the backend role)│
                                                                                └──────────────────┘
```

- **Frontend** — React 19 + Vite + Tailwind CSS v4. Talks to the API over a typed REST
  client (`src/api.ts`) and degrades to a local-only demo mode if the API is unreachable
  (see the "Local"/"Live API" badge in the top bar).
- **Backend** — FastAPI + SQLAlchemy 2.0, layered `routers → deps → models/schemas →
  database`, JWT auth (`python-jose`), passwords hashed with `bcrypt` via `passlib`.
  Schema is owned by Alembic migrations, applied automatically on deploy.
- **Database** — PostgreSQL on Supabase. The backend connects directly with the
  table-owning role (bypassing RLS); RLS is enabled with no policies so Supabase's public
  REST API can't touch the data — only the backend can.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · FastAPI · SQLAlchemy 2.0 ·
Alembic · PostgreSQL (Supabase) · JWT · Docker · GitHub Actions · Railway · Vercel

## Repository layout

```
src/            React frontend (components, auth, typed API client)
backend/        FastAPI service (routers, models, Alembic migrations, tests)
docs/           Screenshots and reference docs
.github/        CI: frontend typecheck+build, backend lint+migrate+test
DEPLOYMENT.md   Full run-locally and deploy-to-production walkthrough
```

## Run it locally

```bash
docker compose up --build      # Postgres + FastAPI on :8000 (seeds demo data)
cp .env.example .env           # sets VITE_API_URL=http://localhost:8000
pnpm install && pnpm dev       # frontend on :8443 (or the printed port)
```

Full instructions, including running the backend without Docker and every production
deploy step (Railway + Supabase + Vercel), are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Quality gates

- **Tests**: `pytest` (backend, isolated per-test SQLite DB) — auth, RBAC, and application
  ownership boundaries are covered.
- **Lint**: `ruff` (backend), `tsc --noEmit` (frontend).
- **CI**: every push/PR runs frontend typecheck+build and backend lint + `alembic upgrade
  head` against a real Postgres service + `pytest` (see `.github/workflows/ci.yml`).
