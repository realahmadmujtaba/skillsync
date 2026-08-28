# SkillSync — Run & Deploy Guide

Frontend: **React + Vite** → **Vercel**
Backend: **FastAPI + PostgreSQL** → **Railway**

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

## Part C — Deploy the backend to Railway (database: Supabase Postgres)

The database lives on **Supabase**, not Railway's own Postgres add-on. A dedicated
project already exists: **`skillsync`** (ref `rargrnjrwforebjwnlkq`, region
`ap-northeast-1`), with the schema applied and RLS enabled (the backend connects as
the table-owning `postgres` role, which bypasses RLS — RLS only blocks Supabase's
public REST API from touching this data).

1. Get the DB password: Supabase Dashboard → project **skillsync** → **Project
   Settings → Database → Connection string → Session pooler**. Copy the password
   (or reset it there if you don't have it) — Session pooler mode is IPv4-safe and
   suited to a long-lived Railway service (vs. Transaction pooler for serverless).
2. Go to **railway.app** → **New Project** → **Deploy from GitHub repo** → pick your repo.
3. Configure the API service:
   - **Settings → Root Directory**: `backend`
   - Railway auto-detects the `Dockerfile` (or the `Procfile`). No start command needed —
     the container listens on Railway's injected `$PORT`.
4. **Variables** tab — add these to the API service:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql+psycopg://postgres.rargrnjrwforebjwnlkq:<DB-PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `CORS_ORIGINS` | your Vercel URL, e.g. `https://skillsync.vercel.app` (add after Part D) |

   > **Important:** this app uses the psycopg 3 driver, so the scheme must be
   > `postgresql+psycopg://` — Supabase's own copy button gives you `postgresql://`,
   > just swap the scheme.

5. Deploy. The container runs **`alembic upgrade head`** automatically on start. The
   schema was already applied directly on Supabase, stamped at revision `0001_initial`,
   so this will simply no-op and confirm the DB is up to date.
6. Opportunities are already seeded (5 demo listings). Real user signups create rows
   in Supabase's `users` table via `/api/auth/signup` — no other seeding needed
   (this deployment intentionally has no demo login accounts; anyone can sign up).
7. Copy your public API URL, e.g. `https://skillsync-api.up.railway.app`.
   Test: `https://<your-api>/api/health`.

---

## Part D — Deploy the frontend to Vercel

1. Go to **vercel.com** → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects **Vite** (config is in `vercel.json`). Leave build settings default:
   - Build command: `pnpm build` · Output: `dist`
3. **Environment Variables** — add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Railway API URL, e.g. `https://skillsync-api.up.railway.app` |
4. **Deploy.** Copy the resulting URL, e.g. `https://skillsync.vercel.app`.

---

## Part E — Connect the two (CORS)

1. Back in **Railway → API service → Variables**, set:
   ```
   CORS_ORIGINS=https://skillsync.vercel.app
   ```
   (comma-separate if you have multiple domains). Redeploy the API.
2. Open your Vercel URL, sign up / log in — the badge shows **Live API**, and data now
   persists in Postgres.

---

## Troubleshooting
- **CORS error in browser console** → `CORS_ORIGINS` on Railway must exactly match your
  Vercel origin (no trailing slash).
- **`could not translate host name` / DB errors** → check the `postgresql+psycopg://` scheme.
- **Login works but nothing persists** → `VITE_API_URL` isn't set on Vercel (badge shows
  "Local"); add it and redeploy.
- **500 on first request** → give the DB a few seconds on cold start, then retry.

## Architecture at a glance
```
Browser ── HTTPS ──> Vercel (React/Vite static)
   │  fetch VITE_API_URL
   └──────────────> Railway (FastAPI) ──> Railway PostgreSQL
                         JWT auth, RBAC, SQLAlchemy
```
