"""Test fixtures: an isolated in-memory SQLite DB and a FastAPI test client.

Tests never touch a real Postgres — the get_db dependency is overridden to use a
fresh SQLite schema created from the models, so `pytest` runs anywhere.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers(client, email="test@skillsync.io", role="student"):
    """Sign up a user and return an Authorization header for it."""
    res = client.post(
        "/api/auth/signup",
        json={"name": "Test User", "email": email, "password": "secret123", "role": role},
    )
    assert res.status_code == 201, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
