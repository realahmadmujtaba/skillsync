from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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
_RESULTS_PER_COUNTRY = 10
_MAX_RESULTS = 30

COUNTRY_NAMES = {
    "us": "United States",
    "gb": "United Kingdom",
    "in": "India",
    "ca": "Canada",
    "au": "Australia",
    "de": "Germany",
    "fr": "France",
    "nl": "Netherlands",
    "sg": "Singapore",
    "nz": "New Zealand",
    "za": "South Africa",
    "at": "Austria",
    "br": "Brazil",
    "mx": "Mexico",
    "pl": "Poland",
    "it": "Italy",
}


def _fetch_adzuna(query: str, country: str) -> list[dict]:
    cache_key = f"{country}:{query.lower()}"
    now = time.time()
    cached = _cache.get(cache_key)
    if cached and now - cached[0] < _CACHE_TTL:
        return cached[1]

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "results_per_page": _RESULTS_PER_COUNTRY,
        "what": query,
        "content-type": "application/json",
    }
    resp = httpx.get(url, params=params, timeout=10.0)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    for r in results:
        r["_country"] = country
    _cache[cache_key] = (now, results)
    return results


def _fetch_all_countries(query: str) -> list[dict]:
    countries = [c.strip() for c in settings.adzuna_countries.split(",") if c.strip()]
    all_results: list[dict] = []
    with ThreadPoolExecutor(max_workers=max(len(countries), 1)) as pool:
        futures = {pool.submit(_fetch_adzuna, query, c): c for c in countries}
        for future in as_completed(futures):
            try:
                all_results.extend(future.result())
            except httpx.HTTPError:
                continue  # one country's API hiccup shouldn't sink the rest
    return all_results


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


def _location_label(r: dict) -> str:
    location = (r.get("location") or {}).get("display_name", "")
    country = r.get("_country", "")
    country_name = COUNTRY_NAMES.get(country, "")
    if country_name and country_name.lower() not in location.lower():
        return f"{location}, {country_name}" if location else country_name
    return location


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

    results = _fetch_all_countries(user.target_role)

    out: list[OpportunityOut] = []
    for r in results:
        title = r.get("title", "").strip()
        if not title:
            continue
        description = r.get("description", "")
        text = f"{title} {description}"
        company = (r.get("company") or {}).get("display_name", "Unknown company")
        tags = [s for s in skills if s.lower() in text.lower()][:4] or ["General"]
        out.append(
            OpportunityOut(
                id=str(r.get("id", "")),
                company=company,
                role=title,
                location=_location_label(r),
                tags=tags,
                match=_match_score(text, skills),
                posted=_relative_time(r.get("created", "")),
            )
        )

    if not out:
        return _fallback(db)
    out.sort(key=lambda o: o.match, reverse=True)
    return out[:_MAX_RESULTS]
