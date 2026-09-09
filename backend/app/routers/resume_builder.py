from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import ResumeDraft

router = APIRouter(prefix="/api/resume/draft", tags=["resume-builder"])

GROQ_MODEL = "openai/gpt-oss-120b"

POLISH_SYSTEM_PROMPT = (
    "You are a professional resume writer. You will be given a work experience "
    "summary and lists of resume bullet points. Rewrite each bullet to be "
    "concise, action-verb-led, and quantified with a specific, plausible "
    "metric where the original implies impact but doesn't state a number — "
    "never invent a company name, job title, project name, or date, and "
    "never fabricate a specific number that isn't at least implied by the "
    "original text. Preserve the exact number of bullets and their order in "
    "each list. Also rewrite the professional summary to be punchy and "
    "specific, 2-3 sentences."
)

POLISH_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "resume_polish",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "experience_bullets": {
                    "type": "array",
                    "items": {"type": "array", "items": {"type": "string"}},
                },
                "project_bullets": {
                    "type": "array",
                    "items": {"type": "array", "items": {"type": "string"}},
                },
            },
            "required": ["summary", "experience_bullets", "project_bullets"],
            "additionalProperties": False,
        },
    },
}


@router.get("", response_model=ResumeDraft)
def get_draft(user: User = Depends(get_current_user)) -> ResumeDraft:
    if not user.resume_draft:
        return ResumeDraft()
    return ResumeDraft.model_validate(json.loads(user.resume_draft))


@router.put("", response_model=ResumeDraft)
def save_draft(
    payload: ResumeDraft,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumeDraft:
    user.resume_draft = payload.model_dump_json()
    db.commit()
    return payload


@router.post("/polish", response_model=ResumeDraft)
def polish_draft(
    payload: ResumeDraft, user: User = Depends(get_current_user)
) -> ResumeDraft:
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="Resume polishing is not configured")

    user_content = json.dumps(
        {
            "summary": payload.summary,
            "experience_bullets": [e.bullets for e in payload.experience],
            "project_bullets": [p.bullets for p in payload.projects],
        }
    )

    client = Groq(api_key=settings.groq_api_key)
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": POLISH_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format=POLISH_SCHEMA,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Polishing failed: {exc}") from exc

    content = response.choices[0].message.content or "{}"
    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail="Polishing returned an unexpected response"
        ) from exc

    exp_bullets = result.get("experience_bullets", [])
    proj_bullets = result.get("project_bullets", [])

    polished = payload.model_copy(deep=True)
    polished.summary = result.get("summary", payload.summary)
    for i, exp in enumerate(polished.experience):
        if i < len(exp_bullets) and len(exp_bullets[i]) == len(exp.bullets):
            exp.bullets = exp_bullets[i]
    for i, proj in enumerate(polished.projects):
        if i < len(proj_bullets) and len(proj_bullets[i]) == len(proj.bullets):
            proj.bullets = proj_bullets[i]

    return polished
