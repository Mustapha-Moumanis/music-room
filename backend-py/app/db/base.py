"""SQLAlchemy declarative base + async engine/session factory.

Mirrors backend/src/prisma/prisma.service.ts: lazy singleton, lifecycle-managed by FastAPI lifespan.
"""

from __future__ import annotations

import secrets
from collections.abc import AsyncIterator
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def generate_cuid() -> str:
    """Prisma emits cuids; we don't need true cuids, only unique opaque IDs.

    URL-safe 24-char token has >128 bits entropy, matching cuid's collision safety.
    Column type stays String so existing cuid-shaped IDs from the Prisma era still fit.
    """
    return secrets.token_urlsafe(18)


class Base(DeclarativeBase):
    """Common base. Add mixins here if we introduce soft-delete etc."""


class TimestampMixin:
    """Mirrors Prisma `createdAt @default(now()) / updatedAt @updatedAt`.

    Postgres `now()` is used for both; `updated_at` is maintained by SQLAlchemy's
    onupdate hook so writes through the ORM behave like Prisma's `@updatedAt`.
    """

    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=False), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt",
        DateTime(timezone=False),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class IdMixin:
    """String PK with a Python-side generator — matches Prisma's `cuid()` default."""

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)


_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def init_engine(database_url: str, echo: bool = False) -> AsyncEngine:
    global _engine, _sessionmaker
    _engine = create_async_engine(database_url, echo=echo, pool_pre_ping=True, future=True)
    _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)
    return _engine


def get_engine() -> AsyncEngine:
    if _engine is None:
        raise RuntimeError("Database engine not initialised; call init_engine() first.")
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    if _sessionmaker is None:
        raise RuntimeError("Session factory not initialised; call init_engine() first.")
    return _sessionmaker


async def dispose_engine() -> None:
    global _engine, _sessionmaker
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _sessionmaker = None


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency: one session per request, rolled back on exception."""
    async with get_sessionmaker()() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
