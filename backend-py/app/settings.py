"""Typed application settings.

Mirrors backend/src/core/config/env.validation.ts one validator at a time. Every env
var name is kept identical so the shared root `.env` works for both services.
"""

from __future__ import annotations

import re
from typing import Annotated, Literal
from urllib.parse import urlparse

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

TTL_RE = re.compile(r"^[1-9]\d*(ms|s|m|h|d|w|y)$")
# Matches NestJS `@IsEmail({ allow_display_name: true, require_tld: false })`:
# accepts bare "local@domain" and "Display <local@domain>", any TLD (incl. .local).
EMAIL_RE = re.compile(r"^(?:[^<>]*<\s*)?[^\s@<>]+@[^\s@<>]+(?:\s*>)?$")
_HTTP_SCHEMES = {"http", "https"}
_POSTGRES_SCHEMES = {"postgres", "postgresql", "postgresql+asyncpg", "postgresql+psycopg"}


def _ensure_http_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in _HTTP_SCHEMES or not parsed.netloc:
        raise ValueError(f"not an http(s) URL: {url!r}")
    return url


def _ensure_postgres_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in _POSTGRES_SCHEMES or not parsed.netloc:
        raise ValueError(f"not a postgresql URL: {url!r}")
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    NODE_ENV: Literal["development", "test", "production"]
    BACKEND_PORT: Annotated[int, Field(ge=1, le=65535)]
    APP_URL: str
    # NoDecode so pydantic-settings doesn't JSON-parse the comma-separated string first;
    # the mode="before" validator splits it manually.
    CORS_ORIGINS: Annotated[list[str], NoDecode]
    LOG_LEVEL: Literal["fatal", "error", "warn", "info", "debug", "trace", "silent"]

    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None

    JWT_ACCESS_SECRET: str
    JWT_ACCESS_TTL: str
    JWT_REFRESH_SECRET: str
    JWT_REFRESH_TTL: str

    EMAIL_VERIFY_TTL: str
    PASSWORD_RESET_TTL: str

    THROTTLE_TTL_MS: Annotated[int, Field(ge=1)]
    THROTTLE_LIMIT: Annotated[int, Field(ge=1)]
    AUTH_THROTTLE_LIMIT: Annotated[int, Field(ge=1)]

    SMTP_HOST: str
    SMTP_PORT: Annotated[int, Field(ge=1, le=65535)]
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    MAIL_FROM: str

    GOOGLE_WEB_CLIENT_ID: str | None = None
    DEEZER_API_URL: str

    @field_validator("APP_URL", "DEEZER_API_URL")
    @classmethod
    def _http_url(cls, value: str) -> str:
        return _ensure_http_url(value)

    @field_validator("DATABASE_URL")
    @classmethod
    def _database_url(cls, value: str) -> str:
        return _ensure_postgres_url(value)

    @field_validator("TEST_DATABASE_URL")
    @classmethod
    def _test_database_url(cls, value: str | None) -> str | None:
        return _ensure_postgres_url(value) if value else None

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            parts = [part.strip() for part in value.split(",") if part.strip()]
            if not parts:
                raise ValueError("CORS_ORIGINS must not be empty")
            return parts
        if isinstance(value, list):
            return value
        raise ValueError("CORS_ORIGINS must be a comma-separated string or list")

    @field_validator("CORS_ORIGINS")
    @classmethod
    def _origins_shape(cls, value: list[str]) -> list[str]:
        pattern = re.compile(r"^https?://[^/?#]+$")
        for origin in value:
            if not pattern.match(origin):
                raise ValueError(f"invalid CORS origin {origin!r}")
        return value

    @field_validator(
        "JWT_ACCESS_TTL",
        "JWT_REFRESH_TTL",
        "EMAIL_VERIFY_TTL",
        "PASSWORD_RESET_TTL",
    )
    @classmethod
    def _ttl(cls, value: str) -> str:
        if not TTL_RE.match(value):
            raise ValueError(f"TTL must match {TTL_RE.pattern!r}, got {value!r}")
        return value

    @field_validator("JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "SMTP_HOST")
    @classmethod
    def _non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value

    @field_validator("MAIL_FROM")
    @classmethod
    def _mail_from(cls, value: str) -> str:
        if not EMAIL_RE.match(value.strip()):
            raise ValueError(f"invalid MAIL_FROM: {value!r}")
        return value


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()  # type: ignore[call-arg]
    return _settings


def reset_settings_cache() -> None:
    """Testing hook — resets the memoised Settings so a new env can be loaded."""
    global _settings
    _settings = None
