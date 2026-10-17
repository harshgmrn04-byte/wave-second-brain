"""Parameterized SQL for private note resources."""

from uuid import UUID

from psycopg import Cursor
from psycopg.rows import DictRow


def insert_note(cursor: Cursor[DictRow], owner_id: UUID, body: str) -> dict:
    cursor.execute(
        "insert into wave.resources (owner_id, body) values (%s, %s) "
        "returning id, body, created_at",
        (owner_id, body),
    )
    row = cursor.fetchone()
    if row is None:
        raise RuntimeError("Insert did not return a note")
    return row


def list_notes(cursor: Cursor[DictRow], owner_id: UUID, limit: int, offset: int) -> list[dict]:
    cursor.execute(
        "select id, body, created_at from wave.resources "
        "where owner_id = %s and kind = 'note' "
        "order by created_at desc, id desc limit %s offset %s",
        (owner_id, limit, offset),
    )
    return cursor.fetchall()


def delete_note(cursor: Cursor[DictRow], owner_id: UUID, resource_id: UUID) -> bool:
    cursor.execute(
        "delete from wave.resources where id = %s and owner_id = %s and kind = 'note' returning id",
        (resource_id, owner_id),
    )
    return cursor.fetchone() is not None
