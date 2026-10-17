from uuid import uuid4

from fastapi.testclient import TestClient

from app.auth import verified_user_id
from app.database import DatabaseUnavailable
from app.main import app
from app.resources import routes


def test_note_routes_require_a_session() -> None:
    client = TestClient(app)
    assert client.get("/resources/notes").status_code == 401
    assert client.post("/resources/notes", json={"body": "Hello"}).status_code == 401
    assert client.delete(f"/resources/notes/{uuid4()}").status_code == 401


def test_local_browser_may_preflight_note_save() -> None:
    response = TestClient(app).options(
        "/resources/notes",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

    delete_response = TestClient(app).options(
        f"/resources/notes/{uuid4()}",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "DELETE",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert delete_response.status_code == 200


def test_note_validation_rejects_blank_oversized_and_null_byte() -> None:
    app.dependency_overrides[verified_user_id] = uuid4
    try:
        client = TestClient(app)
        for body in ("  \n  ", "x" * 10001, "a\x00b"):
            assert client.post("/resources/notes", json={"body": body}).status_code == 422
    finally:
        app.dependency_overrides.clear()


def test_note_failures_are_visible_without_leaking_database_details(monkeypatch) -> None:
    app.dependency_overrides[verified_user_id] = uuid4

    def unavailable(*_args):
        raise DatabaseUnavailable("private connection detail")

    monkeypatch.setattr(routes, "create_note", unavailable)
    monkeypatch.setattr(routes, "get_notes", unavailable)
    monkeypatch.setattr(routes, "remove_note", unavailable)
    try:
        client = TestClient(app)
        for response in (
            client.post("/resources/notes", json={"body": "Hello"}),
            client.get("/resources/notes"),
            client.delete(f"/resources/notes/{uuid4()}"),
        ):
            assert response.status_code == 503
            assert response.json() == {"detail": "Notes are temporarily unavailable."}
    finally:
        app.dependency_overrides.clear()


def test_missing_note_returns_the_same_404_for_any_user(monkeypatch) -> None:
    app.dependency_overrides[verified_user_id] = uuid4
    monkeypatch.setattr(routes, "remove_note", lambda *_args: False)
    try:
        response = TestClient(app).delete(f"/resources/notes/{uuid4()}")
        assert response.status_code == 404
        assert response.json() == {"detail": "Note not found."}
    finally:
        app.dependency_overrides.clear()
