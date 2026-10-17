"""Read-only integration check for the local Google token path."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth import verified_user_id

router = APIRouter()


@router.get("/auth/check")
def check_auth(user_id: Annotated[UUID, Depends(verified_user_id)]) -> dict[str, str]:
    return {"user_id": str(user_id)}
