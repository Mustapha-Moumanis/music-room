from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_session
from app.modules.health.service import check_health

router = APIRouter(prefix="/health", tags=["Health"])


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok", "degraded"])
    db: str = Field(examples=["up", "down"])
    uptime: float = Field(description="Process uptime in seconds")
    timestamp: str = Field(description="ISO-8601 UTC")


@router.get("", response_model=HealthResponse)
async def get_health(
    response: Response,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> HealthResponse:
    report = await check_health(session)
    if report.db != "up":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return HealthResponse(
        status=report.status,
        db=report.db,
        uptime=report.uptime_seconds,
        timestamp=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    )
