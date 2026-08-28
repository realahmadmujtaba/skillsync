from tests.conftest import auth_headers


def test_create_and_list_applications(client):
    headers = auth_headers(client, email="app@x.com")
    created = client.post(
        "/api/applications",
        json={"company": "Northwind", "role": "SWE Intern", "match": 90},
        headers=headers,
    )
    assert created.status_code == 201
    assert created.json()["stage"] == "applied"

    listed = client.get("/api/applications", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_move_application_stage(client):
    headers = auth_headers(client, email="move@x.com")
    app_id = client.post(
        "/api/applications",
        json={"company": "Helios", "role": "Backend Intern", "match": 80},
        headers=headers,
    ).json()["id"]

    moved = client.patch(
        f"/api/applications/{app_id}", json={"stage": "interview"}, headers=headers
    )
    assert moved.status_code == 200
    assert moved.json()["stage"] == "interview"


def test_users_cannot_see_others_applications(client):
    h1 = auth_headers(client, email="user1@x.com")
    h2 = auth_headers(client, email="user2@x.com")
    client.post(
        "/api/applications",
        json={"company": "Private Co", "role": "Intern", "match": 70},
        headers=h1,
    )
    # user2 should see none of user1's applications
    assert client.get("/api/applications", headers=h2).json() == []


def test_requires_auth(client):
    assert client.get("/api/applications").status_code == 401
