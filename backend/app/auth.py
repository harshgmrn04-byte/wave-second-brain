"""Verify a browser bearer token with this project's Supabase Auth server."""

import json
from typing import Annotated
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

bearer = HTTPBearer(auto_error=False)


def verified_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> UUID:
    if credentials is None or not credentials.credentials or len(credentials.credentials) > 8192:
        raise HTTPException(status_code=401, detail="Sign in to continue.")

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise HTTPException(status_code=503, detail="Authentication is not configured.")

    request = Request(
        f"{settings.supabase_url}/auth/v1/user",
        headers={
            "apikey": settings.supabase_publishable_key,
            "Authorization": f"Bearer {credentials.credentials}",
        },
    )
    try:
        with urlopen(request, timeout=8) as response:
            payload = json.load(response)
            return UUID(payload["id"])
    except HTTPError as cause:
        cause.close()
        if cause.code in (401, 403):
            raise HTTPException(status_code=401, detail="Session expired. Sign in again.") from cause
        raise HTTPException(status_code=503, detail="Authentication is temporarily unavailable.") from cause
    except (URLError, TimeoutError, OSError) as cause:
        raise HTTPException(status_code=503, detail="Authentication is temporarily unavailable.") from cause
    except (KeyError, ValueError, TypeError) as cause:
        raise HTTPException(status_code=503, detail="Authentication returned an invalid response.") from cause
