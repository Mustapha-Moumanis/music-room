"""SQLAlchemy declarative base + async engine/session factory.

Lazy singleton, lifecycle-managed by the FastAPI lifespan hook.
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

# asyncpg does not accept a few URL params (notably `?schema=public`); strip them.
_ASYNCPG_REJECTED_PARAMS = frozenset({"schema", "pgbouncer", "pool_timeout", "connection_limit"})


def normalise_database_url(url: str) -> str:
    """Normalise a Postgres DSN for the SQLAlchemy async driver.

    Accepts `postgresql://` or `postgres://` DSNs with optional `?schema=public`;
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
    """Opaque string ID — URL-safe 24-char token with >128 bits of entropy."""
    return secrets.token_urlsafe(18)


class Base(DeclarativeBase):
    """Common base. Add mixins here if we introduce soft-delete etc."""


class TimestampMixin:
    """`createdAt` + `updatedAt` columns, maintained client-side.

    The DB columns are `NOT NULL` without a server-side default, so SQLAlchemy must
    supply the timestamp on every INSERT (via `default=`) and refresh it on every
    UPDATE (via `onupdate=`). `server_default=func.now()` is also set so a direct SQL
    INSERT (bypassing the ORM) still gets a value.
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
    """String PK with a Python-side generator (opaque URL-safe token)."""

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
