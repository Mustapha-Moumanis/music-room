"""Error envelope compatible with backend/src/core/filters/http-exception.filter.ts.

Every HTTP error returns:

    {
      "statusCode": <int>,
      "error":      <http reason phrase>,
      "code":       <optional domain code like 'INVALID_CREDENTIALS'>,
      "message":    <string | string[]>,
      "path":       <request path>,
      "timestamp":  <ISO 8601 UTC>
    }

Keeping this shape byte-identical means the mobile client's error-matching code
(mobile/src/lib/errors.ts) stays untouched during the port.
"""

from __future__ import annotations

from datetime import UTC, datetime
from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

_logger = get_logger("exception")


class AppError(HTTPException):
    """Raise this from service code to return a structured error.

    `code` is the domain error identifier (e.g. 'INVALID_CREDENTIALS') the mobile
    client switches on; the NestJS codebase sets it as `exception.response.code`.
    """

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str | list[str],
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message


def _envelope(
    status_code: int,
    message: str | list[str],
    path: str,
    code: str | None = None,
) -> dict[str, Any]:
    phrase = HTTPStatus(status_code).phrase if 100 <= status_code < 600 else "Error"
    body: dict[str, Any] = {"statusCode": status_code, "error": phrase}
    if code is not None:
        body["code"] = code
    body["message"] = message
    body["path"] = path
    body["timestamp"] = datetime.now(UTC).isoformat().replace("+00:00", "Z")
    return body


def _path_of(request: Request) -> str:
    query = request.url.query
    return f"{request.url.path}?{query}" if query else request.url.path


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_envelope(exc.status_code, exc.message, _path_of(request), exc.code),
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    message: str | list[str]
    code: str | None = None
    detail = exc.detail
    if isinstance(detail, dict):
        raw_message = detail.get("message", detail)
        if isinstance(raw_message, str) or (
            isinstance(raw_message, list) and all(isinstance(x, str) for x in raw_message)
        ):
            message = raw_message
        else:
            message = str(raw_message)
        raw_code = detail.get("code")
        if isinstance(raw_code, str):
            code = raw_code
    elif isinstance(detail, list) and all(isinstance(x, str) for x in detail):
        message = detail
    else:
        message = str(detail) if detail is not None else HTTPStatus(exc.status_code).phrase
    return JSONResponse(
        status_code=exc.status_code,
        content=_envelope(exc.status_code, message, _path_of(request), code),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    # Pydantic validation errors become 400 with a flat list of messages, matching the
    # shape class-validator produces in the Nest service.
    messages = [
        f"{'.'.join(str(loc) for loc in err['loc'] if loc != 'body')}: {err['msg']}".lstrip(": ")
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=400,
        content=_envelope(400, messages, _path_of(request)),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    _logger.error("unhandled_exception", exc_info=exc, path=_path_of(request))
    return JSONResponse(
        status_code=500,
        content=_envelope(500, "Internal server error", _path_of(request)),
    )


def install_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)
