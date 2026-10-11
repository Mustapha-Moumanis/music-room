"""FastAPI application factory.

Wires middleware in order:
  1. Security headers (helmet equivalent)
  2. CORS
  3. Request-id (correlation)
  4. Rate limiter
  5. Exception handlers (as app-level handlers, not middleware)

Swagger docs are served at /api/docs; JSON schema at /api/docs-json — matching
the mobile `openapi` generator can consume the resulting schema directly.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.exceptions import install_exception_handlers
from app.core.logging import RequestIdMiddleware, configure_logging, get_logger
from app.core.ratelimit import build_limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.db.base import dispose_engine, init_engine, normalise_database_url
from app.middleware.action_log import ActionLogMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.friends.router import router as friends_router
from app.modules.health.router import router as health_router
from app.modules.logs.router import router as logs_router
from app.modules.users.router import router as users_router
from app.settings import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.LOG_LEVEL)
    log = get_logger("startup")

    database_url = normalise_database_url(settings.DATABASE_URL)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        init_engine(database_url)
        log.info("engine_started", url=settings.DATABASE_URL.split("@")[-1])
        try:
            yield
        finally:
            await dispose_engine()
            log.info("engine_disposed")

    app = FastAPI(
        title="Music Room API",
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/docs-json",
        swagger_ui_parameters={"persistAuthorization": True},
        lifespan=lifespan,
    )

    limiter = build_limiter(settings)
    app.state.limiter = limiter
    app.state.settings = settings

    # Middleware wraps outermost-first — order defines what each layer sees.
    # Request id must wrap action-log so the log row carries the id; action-log must
    # wrap SlowAPI so throttled responses are still audited; CORS and security headers
    # wrap everything so the browser gets them on every response path.
    app.add_middleware(ActionLogMiddleware)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-request-id"],
    )
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(SecurityHeadersMiddleware, production=settings.NODE_ENV == "production")

    install_exception_handlers(app)

    async def _rate_limit_handler(request: Request, _: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={
                "statusCode": 429,
                "error": "Too Many Requests",
                "message": "Rate limit exceeded",
                "path": request.url.path,
            },
        )

    app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)  # type: ignore[arg-type]

    # /api is the global prefix shared by every router.
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(friends_router, prefix="/api")
    app.include_router(logs_router, prefix="/api")

    return app


app = create_app()
