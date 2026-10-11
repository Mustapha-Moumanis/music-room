"""Redact credentials from log metadata and cap size.

Verbatim port of backend/src/core/logging/redaction.ts. The sensitive-key set is
case-insensitive and matched against each dict key as the structure is walked.
"""

from __future__ import annotations

import json
from typing import Any

SENSITIVE_KEYS: frozenset[str] = frozenset(
    {"authorization", "cookie", "password", "token", "refreshtoken", "idtoken", "accesstoken"}
)
MAX_META_BYTES = 2048


def is_sensitive_key(key: str) -> bool:
    return key.lower() in SENSITIVE_KEYS


def redact_sensitive(value: Any) -> Any:
    if isinstance(value, list):
        return [redact_sensitive(entry) for entry in value]
    if isinstance(value, dict):
        return {
            k: ("[Redacted]" if is_sensitive_key(k) else redact_sensitive(v))
            for k, v in value.items()
        }
    return value


def cap_meta(value: Any, max_bytes: int = MAX_META_BYTES) -> Any:
    """Redact then truncate: oversized metadata becomes `{truncated:true, bytes:N}`."""
    redacted = redact_sensitive(value)
    serialized = json.dumps(redacted, default=str)
    if len(serialized.encode("utf-8")) <= max_bytes:
        return redacted
    return {"truncated": True, "bytes": len(serialized.encode("utf-8"))}
