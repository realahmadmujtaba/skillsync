# Specification-Driven Prompt — Final-Year IT Capstone (Internship-Grade)

## Context

You (the user) are a final-year IT student who wants a capstone project impressive enough
to help crack internships at large, competitive product companies. The deliverable of *this*
task is **not code** — it is a detailed, specification-driven **prompt document** you can:

1. Feed into an AI app builder (Figma Make, v0, etc.) to generate the project, and/or
2. Use directly as your project's requirements/spec document (SRS-style) for your report and viva.

Recruiters and interviewers reward projects that demonstrate **system design, real-time
architecture, AI integration, clean layered code, testing, and cloud deployment** — so the
prompt below is engineered to force those signals into the build. The chosen subject is
**"SkillSync — an AI-Powered Career & Internship Readiness Platform"**: full-stack, AI-enabled,
real-time, and thematically aligned with the goal.

> This plan file *is* the deliverable. On approval, its "The Prompt" section is what you copy
> out and use. No source code in this repo needs to change unless you later ask me to actually
> build SkillSync here.

---

## The Prompt (copy this)

### 1. Project Overview
Build **SkillSync**, a web platform that helps students become internship-ready. It analyzes a
student's resume and skills against real job/internship descriptions, produces a gap analysis,
recommends a personalized learning roadmap, tracks applications, and supports mock-interview
practice — with an admin/mentor dashboard for oversight. The product must feel like a modern,
shipped SaaS product, not a student demo.

### 2. Target Users & Roles
- **Student** — builds profile, uploads resume, gets gap analysis, follows roadmap, tracks applications.
- **Mentor/Recruiter** — reviews student progress, leaves feedback, posts opportunities.
- **Admin** — manages users, content, and analytics.
Implement **role-based access control (RBAC)** with protected routes per role.

### 3. Core Features (functional requirements)
1. **Auth**: email/password + OAuth (Google), JWT/session, password reset, RBAC.
2. **Resume intelligence**: upload PDF/DOCX → parse → extract skills, experience, education.
3. **AI gap analysis**: compare candidate skills vs. a target role; output a match score,
   missing skills, and strengths, with a clear rationale.
4. **Personalized roadmap**: generated ordered learning plan with milestones and resources.
5. **Opportunity board**: searchable/filterable internships; save + one-click track.
6. **Application tracker**: Kanban board (Applied → Interview → Offer/Rejected) with drag-and-drop.
7. **Real-time**: live notifications and mentor feedback via WebSockets.
8. **Mock interview module**: timed question sets; AI-generated feedback on answers.
9. **Analytics dashboard**: readiness score over time, skill coverage, application funnel.
10. **Admin panel**: user management, content moderation, platform metrics.

### 4. Technical Requirements (choose modern, defensible stack)
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, component-driven architecture,
  React Query for server state, accessible UI primitives.
- **Backend**: Node.js (Express/NestJS) **or** Python (FastAPI) — REST + WebSocket layer.
- **Database**: PostgreSQL with a normalized schema and migrations; Redis for caching/sessions.
- **AI layer**: an LLM API for parsing/analysis with structured (JSON-schema) outputs; keep the
  prompt/AI logic in an isolated, swappable service module.
- **Architecture**: clean layered separation (routes → controllers → services → repositories);
  DTO validation; centralized error handling; environment-based config.
- **Non-functional**: pagination, rate limiting, input validation, secure secret handling,
  optimistic UI where sensible, and graceful loading/error/empty states everywhere.

### 5. Data Model (minimum entities)
`User`, `Profile`, `Resume`, `Skill`, `RoleTarget`, `GapAnalysis`, `RoadmapItem`,
`Opportunity`, `Application`, `MockInterview`, `Feedback`, `Notification`. Define relationships,
keys, and constraints explicitly.

### 6. UI/UX Guidelines (modern, professional, user-friendly — MANDATORY)
- **Design stance**: clean, confident, product-grade SaaS. Generous whitespace, strong visual
  hierarchy, a restrained palette (one primary + neutrals + semantic success/warning/error).
- **Typography**: pair a distinctive display/heading font with a highly legible body font;
  consistent type scale; never more than two families.
- **Layout**: responsive-first (mobile → desktop), persistent sidebar nav for the app shell,
  clear top bar with search + notifications + profile. 8pt spacing grid.
- **Components**: reusable cards, tables with sorting/filtering, drag-and-drop Kanban,
  progress rings/bars for scores, skeleton loaders, toasts, modals, empty states with CTAs.
- **Dark mode** support via design tokens/CSS variables.
- **Accessibility**: WCAG AA contrast, full keyboard navigation, focus states, ARIA labels,
  semantic HTML.
- **Data visualization**: readable charts (readiness trend line, skill radar/coverage, funnel)
  with consistent colors, legends, tooltips, and accessible labels.
- **Micro-interactions**: subtle, purposeful motion on state changes; never gratuitous.
- **Craft details**: aligned grids, consistent corner radii and shadows, no orphaned/placeholder
  content, polished error/loading/empty states.

### 7. Engineering Quality (interview signals — REQUIRED)
- TypeScript throughout the frontend; typed API contracts.
- Unit + integration tests (Jest/Vitest) and at least one E2E flow (Playwright/Cypress).
- Linting/formatting, meaningful commits, and a clear branching approach.
- Dockerized services + a CI pipeline (GitHub Actions) running lint/test/build.
- Deployed live (frontend + backend + DB) with a public URL.
- A strong `README`: problem, architecture diagram, tech decisions, setup, screenshots, live demo.

### 8. Deliverables
Working deployed app, source repo with the above quality gates, an architecture/ER diagram,
and a short design-decisions write-up suitable for a viva and for explaining in interviews.

### 9. Constraints & Acceptance Criteria
- Every listed core feature is reachable and functional end-to-end.
- No broken/empty screens; all states handled.
- Passes basic accessibility and responsive checks.
- Code is layered and readable; secrets are not hardcoded.
- The app is deployed and demonstrable from a single URL.

---

## Why this project cracks internships (talking points for your interviews)
- **System design**: RBAC, real-time WebSockets, caching, layered architecture, DB modeling.
- **AI integration** done responsibly (structured outputs, isolated service, evaluable results).
- **Product thinking**: real user problem, multiple roles, analytics, polished UX.
- **Engineering maturity**: tests, CI/CD, Docker, deployment, documentation.

## Verification (how to confirm the deliverable is good)
Since the deliverable is the prompt document itself, "verification" = a review checklist:
1. The prompt names concrete features, stack, data model, and acceptance criteria (not vague goals).
2. UI/UX guidelines are specific and enforceable.
3. Interview/quality signals (tests, CI/CD, deploy, docs) are explicitly required.
4. It can be pasted into an AI builder or used as an SRS with no further clarification.

## Optional follow-ups (only if you want)
- Tailor the prompt to a specific stack (MERN, Next.js, FastAPI) or company type.
- Slim it to a 4-week MVP scope vs. the full build.
- Actually scaffold SkillSync in this repo (React + Vite + Tailwind is already set up).
