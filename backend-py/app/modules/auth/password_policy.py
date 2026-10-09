"""Verbatim port of backend/src/modules/auth/password-policy.ts."""

from __future__ import annotations

import re

_LETTER_RE = re.compile(r"[A-Za-z]")
_DIGIT_RE = re.compile(r"\d")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_password_policy(password: str, email: str) -> bool:
    if len(password) < 10 or len(password) > 128:
        return False
    if not _LETTER_RE.search(password) or not _DIGIT_RE.search(password):
        return False
    return password != normalize_email(email)
