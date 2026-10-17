import io
from urllib.error import HTTPError, URLError
from uuid import uuid4

from fastapi.testclient import TestClient

from app import auth
from app.config import Settings
from app.main import app


def test_auth_check_verifies_token_with_project_auth(monkeypatch) -> None:
    expected_user = uuid4()
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Settings("https://example.supabase.co", "sb_publishable_test", "", "http://localhost:5173"),
    )

    def fake_urlopen(request, timeout):
        assert request.full_url == "https://example.supabase.co/auth/v1/user"
        assert request.get_header("Authorization") == "Bearer example-token"
        assert request.get_header("Apikey") == "sb_publishable_test"
        assert timeout == 8
        return io.BytesIO(('{"id":"' + str(expected_user) + '"}').encode())

    monkeypatch.setattr(auth, "urlopen", fake_urlopen)
    response = TestClient(app).get("/auth/check", headers={"Authorization": "Bearer example-token"})
    assert response.status_code == 200
    assert response.json() == {"user_id": str(expected_user)}


def test_auth_check_rejects_missing_and_invalid_tokens(monkeypatch) -> None:
    client = TestClient(app)
    assert client.get("/auth/check").status_code == 401

    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Settings("https://example.supabase.co", "sb_publishable_test", "", "http://localhost:5173"),
    )

    def rejected(_request, timeout):
        raise HTTPError("https://example.supabase.co/auth/v1/user", 401, "Unauthorized", {}, None)

    monkeypatch.setattr(auth, "urlopen", rejected)
    response = client.get("/auth/check", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401


def test_auth_check_reports_auth_outage(monkeypatch) -> None:
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Settings("https://example.supabase.co", "sb_publishable_test", "", "http://localhost:5173"),
    )

    def unavailable(_request, timeout):
        raise URLError("network unavailable")

    monkeypatch.setattr(auth, "urlopen", unavailable)
    response = TestClient(app).get("/auth/check", headers={"Authorization": "Bearer valid-looking"})
    assert response.status_code == 503
    assert response.json()["detail"] == "Authentication is temporarily unavailable."
