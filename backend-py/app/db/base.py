"""SQLAlchemy declarative base + async engine/session factory.

Mirrors backend/src/prisma/prisma.service.ts: lazy singleton, lifecycle-managed by FastAPI lifespan.
"""

from __future__ import annotations

import secrets
from collections.abc import AsyncIterator
from datetime import datetime
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import DateTime, String, func
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# asyncpg rejects a few Prisma-style URL params (notably `?schema=public`); strip them
# so the Nest-era .env keeps working untouched after the cutover.
_ASYNCPG_REJECTED_PARAMS = frozenset({"schema", "pgbouncer", "pool_timeout", "connection_limit"})


def normalise_database_url(url: str) -> str:
    """Convert Prisma-style URLs to the SQLAlchemy async driver form.

    Prisma / Nest emit `postgresql://` or `postgres://` with possibly `?schema=public`;
    SQLAlchemy's async engine wants `postgresql+asyncpg://` and asyncpg doesn't accept
    `schema` as a connect parameter.
    """
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    parts = urlsplit(url)
    if parts.query:
        kept = [(k, v) for k, v in parse_qsl(parts.query) if k not in _ASYNCPG_REJECTED_PARAMS]
        url = urlunsplit(parts._replace(query=urlencode(kept)))
    return url


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

    Prisma-created tables declare `updatedAt NOT NULL` *without* a Postgres default —
    Prisma itself fills the column from the client on every write. SQLAlchemy's
    `server_default` only kicks in when the column has a DB-level default, which the
    Prisma schema doesn't ship with, so we also provide `default=func.now()` to make
    SQLAlchemy emit `NOW()` on every INSERT. The `onupdate` hook keeps the Prisma
    `@updatedAt` semantics on every UPDATE through the ORM.
    """

    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        default=func.now(),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt",
        DateTime(timezone=False),
        default=func.now(),
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
