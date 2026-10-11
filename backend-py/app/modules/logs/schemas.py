"""Client-side event logging DTOs — mirrors backend/src/modules/logs/client-event.dto.ts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class _Base(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class ClientEvent(_Base):
    action: str = Field(max_length=64, examples=["screen_view"])
    at: datetime | None = Field(default=None, description="ISO-8601 timestamp")
    meta: dict[str, Any] | None = Field(
        default=None,
        description="Optional client metadata. Sensitive keys are redacted, payloads are size capped.",
    )


class ClientEvents(_Base):
    events: list[ClientEvent] = Field(min_length=1, max_length=50)


class ClientEventsAccepted(_Base):
    accepted: int = Field(examples=[2])
