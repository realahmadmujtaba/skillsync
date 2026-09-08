from __future__ import annotations

import httpx

from .config import settings


def send_email(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key or not settings.email_from:
        raise RuntimeError("Email is not configured")
    resp = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={"from": settings.email_from, "to": [to], "subject": subject, "html": html},
        timeout=10.0,
    )
    resp.raise_for_status()
