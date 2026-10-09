"""FastAPI application factory.

Wires middleware in the exact order the NestJS app does:
  1. Security headers (helmet equivalent)
  2. CORS
  3. Request-id (correlation)
  4. Rate limiter
  5. Exception handlers (as app-level handlers, not middleware)

Swagger docs are served at /api/docs; JSON schema at /api/docs-json — matching
backend/src/app.setup.ts so mobile `openapi` generator stays untouched.
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
from app.db.base import dispose_engine, init_engine
from app.modules.auth.router import router as auth_router
from app.modules.health.router import router as health_router
from app.settings import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.LOG_LEVEL)
    log = get_logger("startup")

    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

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

    # /api is the global prefix mirroring backend/src/app.setup.ts:14.
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")

    return app


app = create_app()
