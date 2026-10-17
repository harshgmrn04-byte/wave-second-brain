"""Note operations that bind verified ownership to a database transaction."""

from uuid import UUID

from app.database import user_transaction
from app.resources import repository
from app.resources.schemas import Note, NotePage


def create_note(owner_id: UUID, body: str) -> Note:
    with user_transaction(owner_id) as cursor:
        row = repository.insert_note(cursor, owner_id, body)
    return Note.model_validate(row)


def get_notes(owner_id: UUID, limit: int, offset: int) -> NotePage:
    with user_transaction(owner_id) as cursor:
        rows = repository.list_notes(cursor, owner_id, limit + 1, offset)
    has_more = len(rows) > limit
    return NotePage(
        items=[Note.model_validate(row) for row in rows[:limit]],
        next_offset=offset + limit if has_more else None,
    )


def remove_note(owner_id: UUID, resource_id: UUID) -> bool:
    with user_transaction(owner_id) as cursor:
        return repository.delete_note(cursor, owner_id, resource_id)
