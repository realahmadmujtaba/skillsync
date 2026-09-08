# SkillSync — Run & Deploy Guide

Frontend: **React + Vite** → **Vercel**
Backend: **FastAPI** (Docker) → **Azure App Service** (free Linux F1 tier)
Database: **PostgreSQL** → **Azure Database for PostgreSQL Flexible Server** (free Burstable tier)

---

## Part A — Run locally first (verify everything works)

### A1. Prerequisites
- Docker Desktop — this is the only prerequisite for the Dockerized path below.
- Node 18+ / pnpm and Python 3.12+ are only needed if you run a service *without*
  Docker (see the alternatives below).

### A2. Full stack with Docker (recommended)
From the repo root:
```bash
docker compose up --build
```
This builds and starts two containers:
- **`api`** — FastAPI on `http://localhost:8001`, connected to whatever `DATABASE_URL`
  is set in `backend/.env` (by default, the Azure Postgres DB production also uses — see
  `backend/.env.example` for the connection-string format). Runs `alembic upgrade head`
  on start; swagger docs at `http://localhost:8001/docs`.
- **`web`** — the production Vite build served by nginx on `http://localhost:8443`,
  baked with `VITE_API_URL` from the root `.env` (defaults to `http://localhost:8001`).

Verify:
```bash
curl http://localhost:8001/api/health      # -> {"status":"ok",...}
```
Then open **http://localhost:8443** — the top-bar badge should read **Live API**.

> **Ports 8001/5433 already taken?** Another project on the machine may be using
> 8000/5432 — edit the host-side port numbers in `docker-compose.yml` and the
> `VITE_API_URL` in `.env` to match.

> **Connection refused / timeout against Azure Postgres?** The Azure server's firewall
> is scoped to Azure services plus one specific developer IP (see Part C). If your IP
> changed (new network, VPN), add it in **Azure Portal → skillsync-db → Networking →
> Firewall rules**.

#### No Azure access, or want a fully offline/local database instead
```bash
docker compose --profile local-db up --build
```
This additionally starts a throwaway local Postgres container (`db`, on host port
`5433`). Point `backend/.env`'s `DATABASE_URL` at it —
`postgresql+psycopg://skillsync:skillsync@db:5432/skillsync` — and add
`python -m app.seed &&` before `uvicorn` in the `api` service's `command` in
`docker-compose.yml` to load demo data (three demo accounts, password `password123`).
This path needs no external services and no card/subscription anywhere.

#### Alternative: run a service without Docker
```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL to your Postgres
python -m app.seed            # create tables + demo data
uvicorn app.main:app --reload --port 8000

# frontend (separate terminal, repo root)
cp .env.example .env          # sets VITE_API_URL to match the backend port above
pnpm install
pnpm dev
```
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

## Part C — Deploy the backend to Azure (database: Azure Postgres Flexible Server)

Railway's free trial expired (needs a paid plan), and Render now requires a card even
for its free tier — neither works without a credit card. **Azure for Students**
(activated via the GitHub Student Developer Pack at education.github.com/pack, no card
required) gives free-forever compute (App Service Linux F1) and a free-for-12-months
Postgres tier, which is what's actually deployed.

### C1. Provision the database
```bash
az login   # opens a browser to sign into your Azure for Students subscription
az group create --name skillsync-rg --location <region>
az postgres flexible-server create \
  --resource-group skillsync-rg \
  --name skillsync-db \
  --location <region> \
  --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --admin-user skillsyncadmin --admin-password <a-strong-password> \
  --public-access 0.0.0.0 --yes
```
> **Region gotcha:** Azure-for-Students subscriptions are restricted to a small, silent
> allowlist of regions — the CLI lets you *attempt* any region but rejects most with
> `RequestDisallowedByAzure` / "not accepting new customers". Rather than guessing
> region names, create the server via **Azure Portal** instead (search "Azure Database
> for PostgreSQL flexible servers" → Create) — the Portal's region dropdown is
> pre-filtered to regions your subscription can actually use.

After creating it, lock down the firewall (**Networking** tab): keep **"Allow public
access from any Azure service"** ON (App Service needs this to connect), remove any
wide-open `0.0.0.0-255.255.255.255` rule, and add only your own current IP as a second
rule (for direct access from a local DB client). This is deliberately narrower than a
typical "allow all" quickstart — don't leave a database open to the whole internet just
because it only holds demo data.

Then apply migrations + seed demo data (needs Docker locally, or run `alembic upgrade
head` / `python -m app.seed` from a Python env pointed at the new `DATABASE_URL`):
```bash
docker build -t skillsync-api ./backend
docker run --rm \
  -e DATABASE_URL="postgresql+psycopg://skillsyncadmin:<url-encoded-password>@skillsync-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
  skillsync-api sh -c "alembic upgrade head && python -m app.seed"
```
(URL-encode any special characters in the password — e.g. `@` becomes `%40`.)

### C2. Push the backend image
```bash
gh auth refresh -h github.com -s write:packages   # one-time scope grant
gh auth token | docker login ghcr.io -u <your-github-username> --password-stdin
docker tag skillsync-api ghcr.io/<your-github-username>/skillsync-api:latest
docker push ghcr.io/<your-github-username>/skillsync-api:latest
```
Then make the package public (GitHub → your profile → **Packages** → the package →
**Package settings** → **Change visibility** → **Public**) so App Service can pull it
without stored registry credentials — there's nothing sensitive baked into the image
(env vars are injected at runtime, not build time).

### C3. Create the App Service and wire it up
```bash
az appservice plan create --name skillsync-plan --resource-group skillsync-rg \
  --location <region> --is-linux --sku F1

az webapp create --resource-group skillsync-rg --plan skillsync-plan \
  --name <globally-unique-name> \
  --deployment-container-image-name ghcr.io/<your-github-username>/skillsync-api:latest

az webapp config appsettings set --resource-group skillsync-rg --name <app-name> \
  --settings \
    WEBSITES_PORT=8000 \
    DATABASE_URL="postgresql+psycopg://skillsyncadmin:<url-encoded-password>@skillsync-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
    JWT_SECRET="$(openssl rand -hex 32)" \
    CORS_ORIGINS="https://skillsync-smoky-nine.vercel.app,http://localhost:8443,http://localhost:5173"

az webapp restart --resource-group skillsync-rg --name <app-name>
```
`WEBSITES_PORT` tells App Service which container port to route to (the Dockerfile's
`uvicorn` listens on 8000) — Azure has no `$PORT` convention like Render/Heroku, so this
is required. Verify: `curl https://<app-name>.azurewebsites.net/api/health`.

*(`render.yaml` at the repo root is kept as a fallback Blueprint in case Render access
changes in the future — it's not the active deployment.)*

---

## Part D — Deploy the frontend to Vercel

**Already done:** the Vercel project (`skillsync`, framework auto-detected as Vite from
`vercel.json`) is linked to this GitHub repo and auto-deploys on every push to `main`.
Live at **https://skillsync-smoky-nine.vercel.app**.

Once the Azure API is up, add the one remaining env var so the frontend talks to it:
1. **vercel.com** → project **skillsync** → **Settings → Environment Variables** → add:
   | Key | Value | Environments |
   |-----|-------|--------------|
   | `VITE_API_URL` | your App Service URL, e.g. `https://skillsync-api-ahmad.azurewebsites.net` | Production + Preview |
2. **Deployments** → redeploy (or just push a commit — env var changes need a rebuild,
   since Vite bakes `VITE_API_URL` in at build time, not runtime).

---

## Part E — Connect the two (CORS)

`CORS_ORIGINS` is set directly as an App Service app setting (see C3) to your Vercel
origin(s), comma-separated. If you add or change a Vercel domain, update it:
```bash
az webapp config appsettings set --resource-group skillsync-rg --name <app-name> \
  --settings CORS_ORIGINS="https://your-domain.vercel.app"
```
Redeploy/restart the API after changing it (`az webapp restart ...`).

Then open your Vercel URL, sign up / log in — the badge shows **Live API**, and data now
persists in Postgres.

---

## Troubleshooting
- **CORS error in browser console** → `CORS_ORIGINS` on the App Service must exactly
  match your Vercel origin (no trailing slash).
- **`could not translate host name` / DB errors** → check the `postgresql+psycopg://`
  scheme and that `sslmode=require` is present (Azure Postgres requires TLS).
- **Login works but nothing persists** → `VITE_API_URL` isn't set on Vercel (badge shows
  "Local"); add it and redeploy.
- **Connection timeout to the database** → your current IP isn't in the Postgres
  firewall's allowlist (Azure Portal → skillsync-db → Networking); add it.
- **`RequestDisallowedByAzure` when creating a resource** → your subscription's region
  restriction (see Part C1) — use the Portal's region dropdown instead of guessing CLI
  region names.

## Architecture at a glance
```
Browser ── HTTPS ──> Vercel (React/Vite static)
   │  fetch VITE_API_URL
   └──────────────> Azure App Service (FastAPI, Docker, Linux F1 free) ──> Azure Postgres
                         JWT auth, RBAC, SQLAlchemy                    Flexible Server (free)
```
