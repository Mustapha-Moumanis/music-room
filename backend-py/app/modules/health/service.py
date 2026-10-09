from __future__ import annotations

import time
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True)
class HealthReport:
    status: str  # "ok" | "degraded"
    db: str  # "up" | "down"
    uptime_seconds: float


_boot_time = time.monotonic()


async def check_health(session: AsyncSession) -> HealthReport:
    """Mirrors backend/src/modules/health/health.service.ts: raw `SELECT 1`.

    Returns `db=down` when the query fails; the controller then flips the HTTP
    status to 503. We never raise — the probe is a status report, not an error.
    """
    try:
        await session.execute(text("SELECT 1"))
        db_status = "up"
    except Exception:
        db_status = "down"
    return HealthReport(
        status="ok" if db_status == "up" else "degraded",
        db=db_status,
        uptime_seconds=round(time.monotonic() - _boot_time, 3),
    )
