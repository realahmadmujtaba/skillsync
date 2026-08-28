# SkillSync — Run & Deploy Guide

Frontend: **React + Vite** → **Vercel**
Backend: **FastAPI** → **Render** · Database: **PostgreSQL** → **Supabase**

---

## Part A — Run locally first (verify everything works)

### A1. Prerequisites
- Node 18+ and pnpm (`npm i -g pnpm`)
- Python 3.12+
- Docker Desktop (easiest path for Postgres)

### A2. Start the backend + database with Docker (recommended)
From the repo root:
```bash
docker compose up --build
```
This starts:
- Postgres on `localhost:5432`
- FastAPI on `http://localhost:8000` (auto-creates tables + seeds demo data)
- Swagger docs at `http://localhost:8000/docs`

Verify:
```bash
curl http://localhost:8000/api/health      # -> {"status":"ok",...}
```

#### Alternative: run backend without Docker
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL to your Postgres
python -m app.seed            # create tables + demo data
uvicorn app.main:app --reload --port 8000
```

### A3. Start the frontend
In a second terminal, from the repo root:
```bash
cp .env.example .env          # sets VITE_API_URL=http://localhost:8000
pnpm install
pnpm dev
```
Open the printed URL. The top-bar badge should read **Live API**.
Log in with a demo account (password `password123`):
`student@skillsync.io` · `mentor@skillsync.io` · `admin@skillsync.io`

---

## Part B — Push the code to GitHub
```bash
git add .
git commit -m "SkillSync: full-stack app"
git branch -M main
git remote add origin https://github.com/<you>/skillsync.git
git push -u origin main
```

---

## Part C — Deploy the backend to Render (database: Supabase Postgres)

Railway's free trial had expired and required a paid plan, so the backend is deployed
to **Render**, which has a genuine free tier for Docker web services (spins down after
15 min idle, wakes on the next request — fine for a demo). The database still lives on
**Supabase**. A dedicated project already exists: **`skillsync`** (ref
`rargrnjrwforebjwnlkq`, region `ap-northeast-1`), with the schema applied and RLS
enabled (the backend connects as the table-owning `postgres` role, which bypasses RLS —
RLS only blocks Supabase's public REST API from touching this data).

A `render.yaml` Blueprint at the repo root does most of the setup for you:

1. Get the DB password: Supabase Dashboard → project **skillsync** → **Project
   Settings → Database → Connection string → Session pooler**. Copy the password
   (or reset it there if you don't have it) — Session pooler mode is IPv4-safe and
   suited to a long-lived Render service (vs. Transaction pooler for serverless).
2. Go to **render.com** → sign up/log in (GitHub OAuth is fastest, no card required)
   → **New +** → **Blueprint** → connect and select the `skillsync` GitHub repo.
3. Render reads `render.yaml` and pre-fills the service (`skillsync-api`, Docker,
   `backend/Dockerfile`, free plan, health check `/api/health`). It will prompt for
   the two secret env vars it can't infer:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql+psycopg://postgres.rargrnjrwforebjwnlkq:<DB-PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |

   `CORS_ORIGINS` is already set in `render.yaml` to the live Vercel URL.

   > **Important:** this app uses the psycopg 3 driver, so the scheme must be
   > `postgresql+psycopg://` — Supabase's own copy button gives you `postgresql://`,
   > just swap the scheme.

4. Click **Apply**. The container runs **`alembic upgrade head`** automatically on
   start. The schema was already applied directly on Supabase, stamped at revision
   `0001_initial`, so this will simply no-op and confirm the DB is up to date.
5. Opportunities are already seeded (5 demo listings). Real user signups create rows
   in Supabase's `users` table via `/api/auth/signup` — no other seeding needed
   (this deployment intentionally has no demo login accounts; anyone can sign up).
6. Copy your public API URL, e.g. `https://skillsync-api.onrender.com`.
   Test: `https://<your-api>/api/health` (first request after idle takes ~30-50s to
   wake the free instance — expected, not a bug).

*(If you'd rather use Railway once you're on a paid plan, the same Dockerfile/env vars
apply — just skip the Render steps and deploy from GitHub there instead.)*

---

## Part D — Deploy the frontend to Vercel

**Already done:** the Vercel project (`skillsync`, framework auto-detected as Vite from
`vercel.json`) is linked to this GitHub repo and auto-deploys on every push to `main`.
Live at **https://skillsync-smoky-nine.vercel.app**.

Once the Render API is up, add the one remaining env var so the frontend talks to it:
1. **vercel.com** → project **skillsync** → **Settings → Environment Variables** → add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render API URL, e.g. `https://skillsync-api.onrender.com` |
2. **Deployments** → redeploy (or just push a commit — env var changes need a rebuild).

---

## Part E — Connect the two (CORS)

`render.yaml` already sets `CORS_ORIGINS` to `https://skillsync-smoky-nine.vercel.app`.
If you use a different Vercel domain, update it in **Render → skillsync-api → Environment**:
```
CORS_ORIGINS=https://skillsync-smoky-nine.vercel.app
```
(comma-separate if you have multiple domains). Redeploy the API after changing it.

Then open your Vercel URL, sign up / log in — the badge shows **Live API**, and data now
persists in Postgres.

---

## Troubleshooting
- **CORS error in browser console** → `CORS_ORIGINS` on Render must exactly match your
  Vercel origin (no trailing slash).
- **`could not translate host name` / DB errors** → check the `postgresql+psycopg://` scheme.
- **Login works but nothing persists** → `VITE_API_URL` isn't set on Vercel (badge shows
  "Local"); add it and redeploy.
- **500 on first request / slow first load** → Render's free plan spins the service down
  after 15 min idle; the first request wakes it (~30-50s), then it's fast until idle again.

## Architecture at a glance
```
Browser ── HTTPS ──> Vercel (React/Vite static)
   │  fetch VITE_API_URL
   └──────────────> Render (FastAPI, Docker) ──> Supabase PostgreSQL
                         JWT auth, RBAC, SQLAlchemy          (RLS: backend role only)
```
