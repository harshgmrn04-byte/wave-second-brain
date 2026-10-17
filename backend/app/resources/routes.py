"""Authenticated note endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.auth import verified_user_id
from app.database import DatabaseUnavailable
from app.resources.schemas import Note, NoteCreate, NotePage
from app.resources.service import create_note, get_notes, remove_note

router = APIRouter(prefix="/resources/notes", tags=["notes"])
Owner = Annotated[UUID, Depends(verified_user_id)]


@router.post("", response_model=Note, status_code=201)
def save_note(note: NoteCreate, user_id: Owner) -> Note:
    try:
        return create_note(user_id, note.body)
    except DatabaseUnavailable as cause:
        raise HTTPException(status_code=503, detail="Notes are temporarily unavailable.") from cause


@router.get("", response_model=NotePage)
def read_notes(
    user_id: Owner,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> NotePage:
    try:
        return get_notes(user_id, limit, offset)
    except DatabaseUnavailable as cause:
        raise HTTPException(status_code=503, detail="Notes are temporarily unavailable.") from cause


@router.delete("/{resource_id}", status_code=204)
def delete_note(resource_id: UUID, user_id: Owner) -> Response:
    try:
        deleted = remove_note(user_id, resource_id)
    except DatabaseUnavailable as cause:
        raise HTTPException(status_code=503, detail="Notes are temporarily unavailable.") from cause
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found.")
    return Response(status_code=204)
