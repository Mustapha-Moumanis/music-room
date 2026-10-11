"""Helmet-equivalent security headers.

Added via a Starlette middleware so every HTTP response gets the same headers,
including the Swagger UI page.

The API uses a strict CSP (`script-src 'self'`). Swagger UI loads its JS/CSS from
`cdn.jsdelivr.net`, which the strict policy would block, so for the `/api/docs*`
and `/api/docs-json` paths only we relax CSP to allow the Swagger CDN + favicon
origin. Every API endpoint keeps the strict policy.
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

# Loosened CSP for Swagger UI only — never applied to any API endpoint:
#   - `'unsafe-inline'` on script-src: FastAPI's /api/docs embeds an inline
#     `<script>const ui = SwaggerUIBundle(...)</script>` bootstrap.
#   - `cdn.jsdelivr.net` on script/style/connect: Swagger UI dist assets + the
#     `swagger-ui.css.map` source-map fetch the browser does for DevTools.
#   - `fastapi.tiangolo.com` on img-src: FastAPI favicon.
SWAGGER_CSP = (
    b"default-src 'self'; "
    b"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    b"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    b"img-src 'self' data: https://fastapi.tiangolo.com; "
    b"connect-src 'self' https://cdn.jsdelivr.net; "
    b"base-uri 'self'; "
    b"form-action 'self'; "
    b"frame-ancestors 'self'; "
    b"object-src 'none'"
)

_SWAGGER_PATHS = ("/api/docs", "/api/docs-json")


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp, *, production: bool) -> None:
        self.app = app
        self._csp = CSP_PROD if production else CSP_DEV

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "") or ""
        csp = SWAGGER_CSP if any(path.startswith(p) for p in _SWAGGER_PATHS) else self._csp

        is_swagger = any(path.startswith(p) for p in _SWAGGER_PATHS)

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                raw = list(message.get("headers", []))
                raw.extend(BASE_HEADERS)
                raw.append((b"content-security-policy", csp))
                if is_swagger:
                    # Swagger HTML changes with every CSP/openapi tweak; without `no-store`
                    # Chrome/Safari remember a previously blank page and never refetch.
                    raw.append((b"cache-control", b"no-store"))
                message["headers"] = raw
            await send(message)

        await self.app(scope, receive, send_with_headers)
