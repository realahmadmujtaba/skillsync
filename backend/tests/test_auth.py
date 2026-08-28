from tests.conftest import auth_headers


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_signup_returns_token_and_user(client):
    res = client.post(
        "/api/auth/signup",
        json={"name": "Aarav", "email": "a@x.com", "password": "pw123456", "role": "student"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "a@x.com"
    assert body["user"]["role"] == "student"


def test_duplicate_email_rejected(client):
    payload = {"name": "A", "email": "dup@x.com", "password": "pw123456"}
    assert client.post("/api/auth/signup", json=payload).status_code == 201
    assert client.post("/api/auth/signup", json=payload).status_code == 409


def test_login_success_and_failure(client):
    client.post(
        "/api/auth/signup",
        json={"name": "B", "email": "b@x.com", "password": "pw123456"},
    )
    ok = client.post("/api/auth/login", data={"username": "b@x.com", "password": "pw123456"})
    assert ok.status_code == 200
    assert ok.json()["access_token"]

    bad = client.post("/api/auth/login", data={"username": "b@x.com", "password": "wrong"})
    assert bad.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401
    headers = auth_headers(client, email="me@x.com")
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "me@x.com"
