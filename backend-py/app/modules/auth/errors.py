"""Auth error codes + default messages, mirroring backend/src/core/auth/auth.exception.ts."""

from __future__ import annotations

from typing import Literal

from app.core.exceptions import AppError

AuthErrorCode = Literal[
    "INVALID_CREDENTIALS",
    "WEAK_PASSWORD",
    "EMAIL_NOT_VERIFIED",
    "INVALID_REFRESH_TOKEN",
    "REFRESH_TOKEN_REUSED",
    "SESSION_REVOKED",
    "UNAUTHORIZED",
    "INVALID_RESET_CODE",
    "INVALID_GOOGLE_TOKEN",
    "ACCOUNT_EXISTS_LINK_REQUIRED",
    "GOOGLE_ALREADY_LINKED",
    "GOOGLE_NOT_LINKED",
    "PASSWORD_REQUIRED_TO_UNLINK",
]

_MESSAGES: dict[str, str] = {
    "INVALID_CREDENTIALS": "Invalid email or password.",
    "WEAK_PASSWORD": "Password does not meet policy.",
    "EMAIL_NOT_VERIFIED": "Email address is not verified.",
    "INVALID_REFRESH_TOKEN": "Invalid refresh token.",
    "REFRESH_TOKEN_REUSED": "Refresh token reuse detected.",
    "SESSION_REVOKED": "Session has been revoked.",
    "UNAUTHORIZED": "Authentication is required.",
    "INVALID_RESET_CODE": "Invalid or expired reset code.",
    "INVALID_GOOGLE_TOKEN": "Invalid Google token.",
    "ACCOUNT_EXISTS_LINK_REQUIRED": "An account with this email already exists. Log in and link Google from settings.",
    "GOOGLE_ALREADY_LINKED": "This Google account is already linked.",
    "GOOGLE_NOT_LINKED": "Google is not linked to this account.",
    "PASSWORD_REQUIRED_TO_UNLINK": "Set a password before unlinking Google.",
}


def auth_error(code: AuthErrorCode, status_code: int, message: str | None = None) -> AppError:
    return AppError(status_code=status_code, code=code, message=message or _MESSAGES[code])
