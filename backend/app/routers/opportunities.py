from __future__ import annotations

import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..models import Opportunity, SkillAssessment, User
from ..schemas import OpportunityOut

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

_CACHE_TTL = 300  # seconds
_cache: dict[str, tuple[float, list[dict]]] = {}


def _fetch_adzuna(query: str) -> list[dict]:
    cache_key = f"{settings.adzuna_country}:{query.lower()}"
    now = time.time()
    cached = _cache.get(cache_key)
    if cached and now - cached[0] < _CACHE_TTL:
        return cached[1]

    url = f"https://api.adzuna.com/v1/api/jobs/{settings.adzuna_country}/search/1"
    params = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "results_per_page": 20,
        "what": query,
        "content-type": "application/json",
    }
    resp = httpx.get(url, params=params, timeout=10.0)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    _cache[cache_key] = (now, results)
    return results


def _relative_time(iso_str: str) -> str:
    if not iso_str:
        return "recently"
    try:
        posted = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
    except ValueError:
        return "recently"
    delta = datetime.now(timezone.utc) - posted
    days = delta.days
    if days <= 0:
        return "today"
    if days == 1:
        return "1d ago"
    if days < 14:
        return f"{days}d ago"
    return f"{days // 7}w ago"


def _match_score(text: str, skills: list[str]) -> int:
    if not skills:
        return 50
    text_lower = text.lower()
    hits = sum(1 for s in skills if s.lower() in text_lower)
    return min(100, round(30 + (hits / len(skills)) * 70))


def _fallback(db: Session) -> list[OpportunityOut]:
    rows = db.scalars(select(Opportunity).order_by(Opportunity.match.desc())).all()
    return [OpportunityOut.from_model(o) for o in rows]


@router.get("", response_model=list[OpportunityOut])
def list_opportunities(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[OpportunityOut]:
    if not settings.adzuna_app_id or not settings.adzuna_app_key:
        return _fallback(db)

    skills = [
        s.skill
        for s in db.scalars(
            select(SkillAssessment).where(SkillAssessment.user_id == user.id)
        )
    ]

    try:
        results = _fetch_adzuna(user.target_role)
    except httpx.HTTPError:
        return _fallback(db)

    out: list[OpportunityOut] = []
    for r in results:
        title = r.get("title", "").strip()
        if not title:
            continue
        description = r.get("description", "")
        text = f"{title} {description}"
        company = (r.get("company") or {}).get("display_name", "Unknown company")
        location = (r.get("location") or {}).get("display_name", "")
        tags = [s for s in skills if s.lower() in text.lower()][:4] or ["General"]
        out.append(
            OpportunityOut(
                id=str(r.get("id", "")),
                company=company,
                role=title,
                location=location,
                tags=tags,
                match=_match_score(text, skills),
                posted=_relative_time(r.get("created", "")),
            )
        )

    if not out:
        return _fallback(db)
    out.sort(key=lambda o: o.match, reverse=True)
    return out
