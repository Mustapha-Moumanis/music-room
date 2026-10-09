"""Google ID token verifier — port of backend/src/modules/auth/google-id-token.verifier.ts.

Enforces:
  - Audience matches `GOOGLE_WEB_CLIENT_ID`.
  - Issuer is `accounts.google.com` or `https://accounts.google.com`.
  - `email_verified` is strictly `True`.
  - Both `sub` and `email` claims are present.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.settings import Settings

ErrorCode = Literal[
    "missing_audience",
    "invalid_token",
    "invalid_issuer",
    "email_not_verified",
    "missing_claim",
]
_TRUSTED_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}
_TRANSPORT = google_requests.Request()


@dataclass(frozen=True)
class GoogleIdTokenClaims:
    sub: str
    email: str
    name: str | None = None
    picture: str | None = None


class GoogleIdTokenVerificationError(Exception):
    def __init__(self, message: str, code: ErrorCode) -> None:
        super().__init__(message)
        self.code = code


class GoogleIdTokenVerifier:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def verify(self, raw_id_token: str) -> GoogleIdTokenClaims:
        audience = self._settings.GOOGLE_WEB_CLIENT_ID
        if not audience:
            raise GoogleIdTokenVerificationError(
                "GOOGLE_WEB_CLIENT_ID is not configured", "missing_audience"
            )

        try:
            payload = google_id_token.verify_oauth2_token(raw_id_token, _TRANSPORT, audience)
        except GoogleIdTokenVerificationError:
            raise
        except Exception as exc:  # google-auth raises ValueError / various
            raise GoogleIdTokenVerificationError(
                str(exc) or "Invalid Google idToken", "invalid_token"
            ) from exc

        return self._parse_payload(payload)

    @staticmethod
    def _parse_payload(payload: dict[str, object]) -> GoogleIdTokenClaims:
        sub = payload.get("sub")
        email = payload.get("email")
        if not isinstance(sub, str) or not isinstance(email, str):
            raise GoogleIdTokenVerificationError(
                "Google token is missing required claims", "missing_claim"
            )
        issuer = payload.get("iss")
        if issuer not in _TRUSTED_ISSUERS:
            raise GoogleIdTokenVerificationError(
                "Google token issuer is not trusted", "invalid_issuer"
            )
        if payload.get("email_verified") is not True:
            raise GoogleIdTokenVerificationError(
                "Google email is not verified", "email_not_verified"
            )
        name_value = payload.get("name")
        picture_value = payload.get("picture")
        return GoogleIdTokenClaims(
            sub=sub,
            email=email,
            name=name_value if isinstance(name_value, str) else None,
            picture=picture_value if isinstance(picture_value, str) else None,
        )
