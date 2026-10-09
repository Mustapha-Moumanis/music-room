"""JWT access-token signing + refresh-token issuance.

Access tokens: HS256 with the exact claim shape used by backend/src/core/auth/token.service.ts
(`sub`, `sid`, `typ: "access"`). TTL comes from JWT_ACCESS_TTL settings.

Refresh tokens: composite `{uuid}.{32-byte base64url secret}` where only the SHA256 of the
secret is persisted. Rotation is handled by the auth service inside a SELECT FOR UPDATE
transaction (ports auth.service.ts:84).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import TypedDict

import jwt

from app.core.security import parse_ttl, random_token_urlsafe, sha256_base64url
from app.settings import Settings

JWT_ALGORITHM = "HS256"
_REFRESH_SECRET_RE = __import__("re").compile(r"^[A-Za-z0-9_-]{20,}$")


class AccessTokenClaims(TypedDict):
    sub: str
    sid: str
    typ: str


@dataclass(frozen=True)
class IssuedAccessToken:
    access_token: str
    access_token_expires_in: int  # seconds


@dataclass(frozen=True)
class IssuedRefreshToken:
    id: str
    secret_hash: str
    token: str
    expires_at: datetime


@dataclass(frozen=True)
class ParsedRefreshToken:
    id: str
    secret: str


class InvalidAccessToken(Exception):  # noqa: N818 — stable public name used by deps.py; renaming would break callers
    """Raised when a JWT is malformed, expired, wrong-algo, or has wrong claims."""


def sign_access_token(settings: Settings, user_id: str, session_id: str) -> IssuedAccessToken:
    ttl = parse_ttl(settings.JWT_ACCESS_TTL)
    seconds = int(ttl.total_seconds())
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "sid": session_id,
        "typ": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_ACCESS_SECRET, algorithm=JWT_ALGORITHM)
    return IssuedAccessToken(access_token=token, access_token_expires_in=seconds)


def verify_access_token(settings: Settings, token: str) -> AccessTokenClaims:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_ACCESS_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp"]},
        )
    except jwt.PyJWTError as exc:
        raise InvalidAccessToken(str(exc)) from exc
    sub = payload.get("sub")
    sid = payload.get("sid")
    typ = payload.get("typ")
    if not isinstance(sub, str) or not isinstance(sid, str) or typ != "access":
        raise InvalidAccessToken("missing or invalid claims")
    return {"sub": sub, "sid": sid, "typ": typ}


def issue_refresh_token(settings: Settings, now: datetime | None = None) -> IssuedRefreshToken:
    now = now or datetime.now(UTC)
    token_id = str(uuid.uuid4())
    secret = random_token_urlsafe(32)
    expires_at = now + parse_ttl(settings.JWT_REFRESH_TTL)
    return IssuedRefreshToken(
        id=token_id,
        secret_hash=hash_refresh_secret(secret),
        token=f"{token_id}.{secret}",
        expires_at=expires_at,
    )


def parse_refresh_token(refresh_token: str) -> ParsedRefreshToken | None:
    """Port of token.service.ts:parseRefreshToken — accepts exactly `{uuid}.{secret}`."""
    parts = refresh_token.split(".")
    if len(parts) != 2:
        return None
    token_id, secret = parts
    if not token_id or not secret:
        return None
    if not _REFRESH_SECRET_RE.match(secret):
        return None
    # Validate the id is a UUID (any variant) — same shape Node's randomUUID() produces.
    try:
        uuid.UUID(token_id)
    except ValueError:
        return None
    return ParsedRefreshToken(id=token_id, secret=secret)


def hash_refresh_secret(secret: str) -> str:
    return sha256_base64url(secret)


def new_family_id() -> str:
    return str(uuid.uuid4())


__all__ = [
    "AccessTokenClaims",
    "InvalidAccessToken",
    "IssuedAccessToken",
    "IssuedRefreshToken",
    "ParsedRefreshToken",
    "hash_refresh_secret",
    "issue_refresh_token",
    "new_family_id",
    "parse_refresh_token",
    "sign_access_token",
    "verify_access_token",
]
