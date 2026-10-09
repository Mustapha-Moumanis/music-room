"""Verbatim port of backend/src/core/logging/client-info.ts.

Reads x-platform / x-device / x-app-version / x-request-id from request headers,
trims and caps at 128 chars, falls back to 'unknown' (empty string for requestId).
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

MAX_HEADER_LENGTH = 128


@dataclass(frozen=True)
class ClientInfo:
    platform: str
    device: str
    app_version: str
    request_id: str = ""


def _clean(value: str | None, fallback: str = "unknown") -> str:
    if value is None:
        return fallback
    trimmed = value.strip()
    if not trimmed:
        return fallback
    return trimmed[:MAX_HEADER_LENGTH]


def extract_client_info(headers: Mapping[str, str] | None = None) -> ClientInfo:
    headers = headers or {}

    def h(key: str) -> str | None:
        return headers.get(key) or headers.get(key.lower()) or headers.get(key.upper())

    return ClientInfo(
        platform=_clean(h("x-platform")),
        device=_clean(h("x-device")),
        app_version=_clean(h("x-app-version")),
        request_id=_clean(h("x-request-id"), ""),
    )
