"""Exercise note save/list through FastAPI with two synthetic users, then clean up.

Run from backend/: .venv/bin/python -m scripts.prove_note_api
This does not test Google login; the read-only Auth check covers that separately.
"""

from uuid import uuid4

from fastapi.testclient import TestClient

from app.auth import verified_user_id
from app.database import user_transaction
from app.main import app


def main() -> None:
    first_user, second_user = uuid4(), uuid4()
    current_user = first_user
    resource_id = None
    app.dependency_overrides[verified_user_id] = lambda: current_user
    client = TestClient(app)

    try:
        created = client.post("/resources/notes", json={"body": "Synthetic API proof note"})
        assert created.status_code == 201, f"Create returned {created.status_code}"
        resource_id = created.json()["id"]

        listed = client.get("/resources/notes")
        assert listed.status_code == 200, f"List returned {listed.status_code}"
        assert any(item["id"] == resource_id for item in listed.json()["items"])

        current_user = second_user
        other_list = client.get("/resources/notes")
        assert other_list.status_code == 200, f"Other user's list returned {other_list.status_code}"
        assert all(item["id"] != resource_id for item in other_list.json()["items"])
        other_delete = client.delete(f"/resources/notes/{resource_id}")
        assert other_delete.status_code == 404, "Other user could delete the note"

        invalid = client.post("/resources/notes", json={"body": "   "})
        assert invalid.status_code == 422, "Whitespace-only note was accepted"
        current_user = first_user
        owner_delete = client.delete(f"/resources/notes/{resource_id}")
        assert owner_delete.status_code == 204, "Owner could not delete the note"
        resource_id = None
        print("PASS: note create/list/delete, validation, and two-identity API isolation")
    finally:
        app.dependency_overrides.clear()
        if resource_id is not None:
            with user_transaction(first_user) as cursor:
                cursor.execute("delete from wave.resources where id = %s and owner_id = %s", (resource_id, first_user))


if __name__ == "__main__":
    main()
