"""ASGI middleware that records one ActionLog(HTTP) row per request.

Timing is captured from
request start to response-finish (`send` of `http.response.body` with `more_body=False`).
Skips `/api/health` and anything under `/api/docs/`.

The user id is read from `scope["state"]["user_id"]` if the auth dep set it; otherwise
anonymous. The matched route pattern comes from Starlette's `scope["route"].path`,
which is populated after routing resolves (and may be `None` for 404s — then we fall
back to the raw path).
"""

from __future__ import annotations

import time
from typing import Any

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.action_log import ActionLogEntry, record
from app.db.enums import ActionLogKind
from app.middleware.client_info import extract_client_info

_SKIP_PREFIXES = ("/api/health", "/api/docs")


def _should_skip(path: str) -> bool:
    return any(path.startswith(p) for p in _SKIP_PREFIXES)


_API_PREFIX = "/api"


def _route_pattern(scope: Scope, raw_path: str) -> str:
    """Returns the matched template path (e.g. `/api/users/{id}`).

    Falls back to the raw path when no route matched (404).
    """
    route = scope.get("route")
    if route is not None:
        pattern = getattr(route, "path", None)
        if isinstance(pattern, str):
            # Routers are mounted at prefix="/api" so route.path lacks it; prepend to
            # produce the full logged path (`/api/auth/login`, not `/auth/login`).
            if pattern.startswith(_API_PREFIX):
                return pattern
            return f"{_API_PREFIX}{pattern}" if pattern.startswith("/") else pattern
    return raw_path.split("?", 1)[0] or "unknown"


class ActionLogMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        raw_path = scope.get("path", "") or ""
        if _should_skip(raw_path):
            await self.app(scope, receive, send)
            return

        started = time.monotonic()
        status_holder: dict[str, Any] = {"code": 0}

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                status_holder["code"] = int(message.get("status", 0))
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            # Our exception handlers always produce a 4xx/5xx response themselves, so a raw
            # exception reaching this layer is a 500 by definition.
            
            self._record(scope, raw_path, 500, started)
            raise
        else:
            self._record(scope, raw_path, status_holder["code"] or 200, started)

    def _record(self, scope: Scope, raw_path: str, status_code: int, started: float) -> None:
        method = str(scope.get("method", "GET"))
        headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
        info = extract_client_info(headers)
        route = _route_pattern(scope, raw_path)
        client = scope.get("client")
        ip = client[0] if isinstance(client, tuple) and client else None
        state = scope.get("state", {}) if isinstance(scope.get("state"), dict) else {}
        user_id = state.get("user_id") if isinstance(state, dict) else None
        duration_ms = int((time.monotonic() - started) * 1000)
        record(
            ActionLogEntry(
                kind=ActionLogKind.HTTP,
                action=f"{method} {route}",
                method=method,
                route=route,
                status_code=status_code,
                duration_ms=duration_ms,
                ip=ip,
                user_id=user_id if isinstance(user_id, str) else None,
                platform=info.platform,
                device=info.device,
                app_version=info.app_version,
                request_id=info.request_id or scope.get("request_id") or None,  # type: ignore[arg-type]
            )
        )
