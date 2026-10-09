"""Helmet-equivalent security headers.

Mirrors the CSP defined in backend/src/app.setup.ts:15-25. Added via a Starlette
middleware so FastAPI's own routes and the Swagger UI inherit the same headers.
"""

from __future__ import annotations

from starlette.types import ASGIApp, Message, Receive, Scope, Send

BASE_HEADERS: tuple[tuple[bytes, bytes], ...] = (
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"SAMEORIGIN"),
    (b"referrer-policy", b"no-referrer"),
    (b"strict-transport-security", b"max-age=15552000; includeSubDomains"),
    (b"x-dns-prefetch-control", b"off"),
    (b"x-download-options", b"noopen"),
    (b"x-permitted-cross-domain-policies", b"none"),
    (b"cross-origin-opener-policy", b"same-origin"),
    (b"cross-origin-resource-policy", b"same-origin"),
)

CSP_DEV = (
    b"default-src 'self'; "
    b"script-src 'self'; "
    b"style-src 'self' 'unsafe-inline'; "
    b"img-src 'self' data:; "
    b"base-uri 'self'; "
    b"form-action 'self'; "
    b"frame-ancestors 'self'; "
    b"object-src 'none'"
)
CSP_PROD = CSP_DEV + b"; upgrade-insecure-requests"


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp, *, production: bool) -> None:
        self.app = app
        self._csp = CSP_PROD if production else CSP_DEV

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                raw = list(message.get("headers", []))
                raw.extend(BASE_HEADERS)
                raw.append((b"content-security-policy", self._csp))
                message["headers"] = raw
            await send(message)

        await self.app(scope, receive, send_with_headers)
