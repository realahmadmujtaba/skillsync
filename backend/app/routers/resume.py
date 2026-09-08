from __future__ import annotations

import io
import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from groq import Groq
from pypdf import PdfReader
from sqlalchemy import delete
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..models import ReadinessSnapshot, SkillAssessment, SkillStatus, User
from ..schemas import ResumeAnalysisOut, ResumeExtraction, SkillOut

router = APIRouter(prefix="/api/resume", tags=["resume"])

MAX_RESUME_BYTES = 5 * 1024 * 1024
GROQ_MODEL = "openai/gpt-oss-120b"

ANALYSIS_SYSTEM_PROMPT = (
    "You are a technical recruiter assessing a candidate's resume against a "
    "specific target role. Extract 6 to 10 concrete skills relevant to the "
    "target role. For each skill, estimate coverage from 0-100 (how strongly "
    "the resume evidences it), a status ('strong' for >=75, 'growing' for "
    "45-74, 'gap' for <45), and a one-sentence note citing specific evidence "
    "from the resume (or its absence). Then write one short, specific "
    "recommendation sentence naming the single highest-leverage skill to "
    "improve next and why."
)

RESUME_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "resume_extraction",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "skill": {"type": "string"},
                            "coverage": {"type": "integer"},
                            "status": {
                                "type": "string",
                                "enum": ["strong", "growing", "gap"],
                            },
                            "note": {"type": "string"},
                        },
                        "required": ["skill", "coverage", "status", "note"],
                        "additionalProperties": False,
                    },
                },
                "recommendation": {"type": "string"},
            },
            "required": ["skills", "recommendation"],
            "additionalProperties": False,
        },
    },
}


def _extract_pdf_text(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:  # pypdf raises various error types for malformed PDFs
        raise HTTPException(status_code=400, detail="Could not read this PDF") from exc
    if not text.strip():
        raise HTTPException(
            status_code=422, detail="No extractable text found in this PDF"
        )
    return text


@router.post("/analyze", response_model=ResumeAnalysisOut)
def analyze_resume(
    target_role: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumeAnalysisOut:
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="Resume analysis is not configured")
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported")

    data = file.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="Resume must be under 5 MB")

    resume_text = _extract_pdf_text(data)

    client = Groq(api_key=settings.groq_api_key)
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Target role: {target_role}\n\nResume text:\n{resume_text}",
                },
            ],
            response_format=RESUME_SCHEMA,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Resume analysis failed: {exc}") from exc

    content = response.choices[0].message.content or "{}"
    try:
        extraction = ResumeExtraction.model_validate(json.loads(content))
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=502, detail="Resume analysis returned an unexpected response"
        ) from exc

    if not extraction.skills:
        raise HTTPException(
            status_code=422, detail="Could not extract any skills from this resume"
        )

    readiness = round(sum(s.coverage for s in extraction.skills) / len(extraction.skills))

    db.execute(delete(SkillAssessment).where(SkillAssessment.user_id == user.id))
    for s in extraction.skills:
        db.add(
            SkillAssessment(
                user_id=user.id,
                skill=s.skill,
                coverage=s.coverage,
                status=SkillStatus(s.status),
                note=s.note,
            )
        )
    user.target_role = target_role
    user.readiness = readiness
    db.add(ReadinessSnapshot(user_id=user.id, score=readiness))
    db.commit()

    return ResumeAnalysisOut(
        target_role=target_role,
        readiness=readiness,
        recommendation=extraction.recommendation,
        skills=[
            SkillOut(skill=s.skill, coverage=s.coverage, status=SkillStatus(s.status), note=s.note)
            for s in extraction.skills
        ],
    )
