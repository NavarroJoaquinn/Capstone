"""Security helpers, including optional JWT validation."""
from __future__ import annotations

import logging
from typing import Any, Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings


logger = logging.getLogger("dashboard-service")
_auth_scheme = HTTPBearer(auto_error=False)


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_auth_scheme),
) -> Dict[str, Any]:
    """Return the current user, validating JWT tokens when required."""

    settings = get_settings()
    if not settings.require_auth:
        if credentials and credentials.credentials:
            try:
                payload = jwt.decode(
                    credentials.credentials, settings.jwt_secret, algorithms=["HS256"]
                )
                logger.debug("Decoded optional JWT for anonymous mode")
                return payload
            except jwt.PyJWTError as exc:
                logger.warning("Ignoring invalid JWT in non-auth mode: %s", exc)
        return {"sub": "anonymous"}

    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        logger.warning("Expired JWT: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.PyJWTError as exc:
        logger.error("Invalid JWT: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    return payload