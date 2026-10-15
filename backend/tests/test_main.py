from fastapi.testclient import TestClient

from app.main import app


def test_health_and_openapi() -> None:
    client = TestClient(app)

    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    schema = client.get("/openapi.json")
    assert schema.status_code == 200
    assert "/health/live" in schema.json()["paths"]

    docs = client.get("/docs")
    assert docs.status_code == 200
