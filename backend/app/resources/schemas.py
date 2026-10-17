"""HTTP shapes for plain-text note resources."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class NoteCreate(BaseModel):
    body: str = Field(min_length=1, max_length=10000)

    @field_validator("body")
    @classmethod
    def validate_body(cls, body: str) -> str:
        if not body.strip() or "\x00" in body:
            raise ValueError("A note needs visible text and cannot contain a null byte.")
        return body


class Note(BaseModel):
    id: UUID
    body: str
    created_at: datetime


class NotePage(BaseModel):
    items: list[Note]
    next_offset: int | None
