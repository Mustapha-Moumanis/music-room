"""Fire-and-forget ActionLog recorder.

The caller never awaits a write — failures are logged and swallowed so observability
can't take the request path down. Each write opens a fresh session so it survives
the request session being closed by the time the task runs.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.logging import get_logger
from app.core.redaction import cap_meta
from app.db.base import get_sessionmaker
from app.db.enums import ActionLogKind
from app.db.models.action_log import ActionLog

_logger = get_logger("action_log")
_ACTION_MAX_LEN = 128


@dataclass(frozen=True)
class ActionLogEntry:
    kind: ActionLogKind
    action: str
    platform: str
    device: str
    app_version: str
    user_id: str | None = None
    method: str | None = None
    route: str | None = None
    status_code: int | None = None
    request_id: str | None = None
    duration_ms: int | None = None
    ip: str | None = None
    meta: Any = None
    created_at: datetime | None = None


def record(entry: ActionLogEntry) -> None:
    """Schedule a write; returns immediately."""
    task = asyncio.create_task(_write(get_sessionmaker(), entry))
    # Store a strong ref so the task isn't garbage-collected before it runs.
    _pending.add(task)
    task.add_done_callback(_pending.discard)


async def record_many(entries: list[ActionLogEntry]) -> None:
    """Awaitable bulk variant — used by `/api/logs/client` where the caller counts entries."""
    sm = get_sessionmaker()
    await asyncio.gather(*(_write(sm, e) for e in entries), return_exceptions=True)


_pending: set[asyncio.Task[Any]] = set()


async def _write(sessionmaker: async_sessionmaker, entry: ActionLogEntry) -> None:
    try:
        async with sessionmaker() as session:
            session.add(
                ActionLog(
                    user_id=entry.user_id,
                    kind=entry.kind,
                    action=entry.action[:_ACTION_MAX_LEN],
                    method=entry.method,
                    route=entry.route,
                    status_code=entry.status_code,
                    platform=entry.platform,
                    device=entry.device,
                    app_version=entry.app_version,
                    request_id=entry.request_id,
                    duration_ms=entry.duration_ms,
                    ip=entry.ip,
                    meta=None if entry.meta is None else cap_meta(entry.meta),
                    created_at=entry.created_at,
                )
            )
            await session.commit()
    except Exception as exc:
        _logger.warning("action_log_write_failed", error=str(exc))
