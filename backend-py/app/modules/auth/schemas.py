"""Pydantic v2 schemas for every auth endpoint.

Field names, min/max, regexes, and example values are kept byte-identical with the
class-validator DTOs in backend/src/modules/auth/dto/* so mobile request/response bodies
don't need any changes.
"""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.db.enums import IdentityProvider
from app.modules.auth.password_policy import normalize_email, validate_password_policy

_SIX_DIGIT_RE = re.compile(r"^\d{6}$")
# Mirrors class-validator's default `@IsEmail()` from the Nest service: `local@domain.tld`
# with the TLD being any string of letters (so `foo@bar.local` is accepted — the demo
# seeds use `demo1@musicroom.local`).
_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _email_validator(value: object) -> object:
    if not isinstance(value, str):
        return value
    candidate = normalize_email(value)
    if not _EMAIL_RE.match(candidate):
        raise ValueError("value is not a valid email address")
    return candidate


class _Base(BaseModel):
    # populate_by_name lets us build responses by Python field name OR alias; `extra=forbid`
    # keeps the request-side rejection semantics of Nest's ValidationPipe(whitelist=true).
    model_config = ConfigDict(str_strip_whitespace=False, extra="forbid", populate_by_name=True)


class RegisterRequest(_Base):
    email: str = Field(examples=["john@example.com"])
    password: str = Field(min_length=10, max_length=128, examples=["musicRoom42"])
    display_name: str = Field(
        min_length=1,
        max_length=80,
        examples=["john"],
        alias="displayName",
        serialization_alias="displayName",
        validation_alias="displayName",
    )

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v: object) -> object:
        return _email_validator(v)

    @field_validator("display_name", mode="before")
    @classmethod
    def _trim_display_name(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v


class RegisterResponse(_Base):
    message: str = Field(
        examples=["If the address can be used, a verification email has been sent."]
    )


class LoginRequest(_Base):
    email: str = Field(examples=["john@example.com"])
    password: str = Field(examples=["musicRoom42"])

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v: object) -> object:
        return _email_validator(v)


class LoginUser(_Base):
    id: str
    email: str
    display_name: str = Field(alias="displayName", serialization_alias="displayName")


class LoginResponse(_Base):
    access_token: str = Field(alias="accessToken", serialization_alias="accessToken")
    access_token_expires_in: int = Field(
        alias="accessTokenExpiresIn", serialization_alias="accessTokenExpiresIn", examples=[900]
    )
    refresh_token: str = Field(alias="refreshToken", serialization_alias="refreshToken")
    refresh_token_expires_at: str = Field(
        alias="refreshTokenExpiresAt", serialization_alias="refreshTokenExpiresAt"
    )
    user: LoginUser


class RefreshRequest(_Base):
    refresh_token: str = Field(
        alias="refreshToken",
        validation_alias="refreshToken",
        serialization_alias="refreshToken",
        examples=["22a85df0-146b-43cd-bcf3-b025598c546c.zZ2rQ-32-byte-secret"],
    )


class RefreshResponse(_Base):
    access_token: str = Field(alias="accessToken", serialization_alias="accessToken")
    access_token_expires_in: int = Field(
        alias="accessTokenExpiresIn", serialization_alias="accessTokenExpiresIn", examples=[900]
    )
    refresh_token: str = Field(alias="refreshToken", serialization_alias="refreshToken")
    refresh_token_expires_at: str = Field(
        alias="refreshTokenExpiresAt", serialization_alias="refreshTokenExpiresAt"
    )


class EmailRequest(_Base):
    email: str = Field(examples=["john@example.com"])

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v: object) -> object:
        return _email_validator(v)


class LogoutRequest(_Base):
    refresh_token: str = Field(
        alias="refreshToken",
        validation_alias="refreshToken",
        serialization_alias="refreshToken",
    )


class GoogleIdTokenRequest(_Base):
    id_token: str = Field(
        min_length=1,
        alias="idToken",
        validation_alias="idToken",
        serialization_alias="idToken",
    )


class PasswordResetRequest(_Base):
    email: str = Field(examples=["john@example.com"])
    code: str = Field(examples=["123456"])
    new_password: str = Field(
        min_length=10,
        max_length=128,
        alias="newPassword",
        validation_alias="newPassword",
        serialization_alias="newPassword",
        examples=["newMusicRoom42"],
    )

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v: object) -> object:
        return _email_validator(v)

    @field_validator("code")
    @classmethod
    def _six_digits(cls, v: str) -> str:
        if not _SIX_DIGIT_RE.match(v):
            raise ValueError("code must be exactly 6 digits")
        return v


class MessageResponse(_Base):
    message: str


class MeResponse(_Base):
    id: str
    email: str
    display_name: str = Field(alias="displayName", serialization_alias="displayName")
    email_verified: bool = Field(alias="emailVerified", serialization_alias="emailVerified")
    has_password: bool = Field(alias="hasPassword", serialization_alias="hasPassword")
    providers: list[IdentityProvider]


def apply_password_policy(password: str, email: str) -> bool:
    """Returns True when the password satisfies the shared policy.

    Lives on this schema module so the service layer and DTO validators share one impl.
    """
    return validate_password_policy(password, email)
