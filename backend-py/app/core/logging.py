"""Structured JSON logging with a request-id correlation field.

Mirrors backend/src/core/logging/logging.module.ts: pino-style JSON lines, LOG_LEVEL
from settings, request id either from inbound `x-request-id` or minted per request.
"""

from __future__ import annotations

import logging
import sys
import uuid
from contextvars import ContextVar
from typing import Any

import structlog
from starlette.types import ASGIApp, Receive, Scope, Send

_PINO_TO_STDLIB = {
    "trace": logging.DEBUG,
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warn": logging.WARNING,
    "error": logging.ERROR,
    "fatal": logging.CRITICAL,
    "silent": logging.CRITICAL + 10,
}

_request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


def current_request_id() -> str:
    return _request_id_ctx.get()


def _inject_request_id(_: Any, __: str, event_dict: dict[str, Any]) -> dict[str, Any]:
    rid = _request_id_ctx.get()
    if rid:
        event_dict.setdefault("request_id", rid)
    return event_dict


def configure_logging(level: str) -> None:
    stdlib_level = _PINO_TO_STDLIB.get(level, logging.INFO)
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=stdlib_level,
        force=True,
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            _inject_request_id,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(stdlib_level),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name) if name else structlog.get_logger()


class RequestIdMiddleware:
    """Set `x-request-id` on both inbound context and outbound response.

    Reads an incoming `x-request-id` or mints a UUID4. Mirrors the nestjs-pino
    `genReqId` configured in backend/src/core/logging/logging.module.ts.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
        rid = headers.get("x-request-id") or uuid.uuid4().hex
        token = _request_id_ctx.set(rid)
        scope["request_id"] = rid  # type: ignore[typeddict-unknown-key]

        async def send_with_header(message: dict[str, Any]) -> None:
            if message["type"] == "http.response.start":
                raw_headers = list(message.get("headers", []))
                raw_headers.append((b"x-request-id", rid.encode()))
                message["headers"] = raw_headers
            await send(message)

        try:
            await self.app(scope, receive, send_with_header)
        finally:
            _request_id_ctx.reset(token)
