"""Global and per-route rate limiting via slowapi.

Mirrors @nestjs/throttler config in backend/src/app.module.ts:17-24:
  THROTTLE_TTL_MS: window in ms
  THROTTLE_LIMIT:  requests per window (global)
  AUTH_THROTTLE_LIMIT: tighter cap on /auth/* routes

slowapi stores counters in-process; swap `in-memory` for Redis via `storage_uri`
when horizontal scaling lands.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.settings import Settings


def build_limiter(settings: Settings) -> Limiter:
    window_seconds = max(1, settings.THROTTLE_TTL_MS // 1000)
    return Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.THROTTLE_LIMIT}/{window_seconds} seconds"],
        storage_uri="memory://",
    )


def auth_limit(settings: Settings) -> str:
    """String limit expression to pass to @limiter.limit() on /auth routes."""
    window_seconds = max(1, settings.THROTTLE_TTL_MS // 1000)
    return f"{settings.AUTH_THROTTLE_LIMIT}/{window_seconds} seconds"
