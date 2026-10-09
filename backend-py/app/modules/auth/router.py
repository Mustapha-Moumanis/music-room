"""Auth endpoints — same paths, status codes, and bodies as backend/src/modules/auth/auth.controller.ts."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import HTMLResponse
from slowapi import Limiter

from app.core.ratelimit import auth_limit
from app.deps import (
    AuthServiceDep,
    CurrentUserDep,
    RequestContextDep,
    SettingsDep,
)
from app.modules.auth.schemas import (
    EmailRequest,
    GoogleIdTokenRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MeResponse,
    MessageResponse,
    PasswordResetRequest,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.modules.auth.service import GENERIC_REGISTER_MESSAGE, GENERIC_RESEND_MESSAGE

router = APIRouter(prefix="/auth", tags=["auth"])


def _bind_limiter(request: Request, settings: SettingsDep) -> Limiter:
    """Expose the app-wide limiter plus a per-request auth-tier limit decorator.

    SlowAPI integrates by decorating routes; here we just return the limiter so routes
    can reference its string limit expression without importing settings themselves.
    """
    limiter = getattr(request.app.state, "limiter", None)
    if limiter is None:
        raise HTTPException(status_code=500, detail="rate limiter not configured")
    # Attach the auth-tier limit lazily; slowapi reads it from request.state.
    request.state.view_rate_limit = auth_limit(settings)
    return limiter


LimiterDep = Annotated[Limiter, Depends(_bind_limiter)]


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=RegisterResponse,
    summary="Register with email and password",
)
async def register(
    dto: RegisterRequest,
    service: AuthServiceDep,
    _limiter: LimiterDep,
) -> RegisterResponse:
    message = await service.register(dto)
    return RegisterResponse(message=message)


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=LoginResponse,
    summary="Log in with email and password",
)
async def login(
    dto: LoginRequest,
    service: AuthServiceDep,
    ctx: RequestContextDep,
    _limiter: LimiterDep,
) -> LoginResponse:
    return await service.login(dto, ctx)


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=RefreshResponse,
    summary="Rotate a refresh token",
)
async def refresh(
    dto: RefreshRequest,
    service: AuthServiceDep,
    ctx: RequestContextDep,
    _limiter: LimiterDep,
) -> RefreshResponse:
    return await service.refresh(dto.refresh_token, ctx)


@router.get(
    "/verify",
    response_class=HTMLResponse,
    summary="Verify an email address",
)
async def verify_email(
    service: AuthServiceDep,
    token: Annotated[str | None, Query()] = None,
) -> HTMLResponse:
    status_code, html = await service.verify_email(token)
    return HTMLResponse(content=html, status_code=status_code)


@router.post(
    "/verify/resend",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=MessageResponse,
    summary="Resend email verification",
)
async def resend_verification(
    dto: EmailRequest,
    service: AuthServiceDep,
    _limiter: LimiterDep,
) -> MessageResponse:
    message = await service.resend_verification(dto.email)
    _ = GENERIC_RESEND_MESSAGE  # keep import used — generic message exported for tests
    return MessageResponse(message=message)


@router.post(
    "/password/forgot",
    status_code=status.HTTP_200_OK,
    response_model=MessageResponse,
    summary="Request a password reset code",
)
async def forgot_password(
    dto: EmailRequest,
    service: AuthServiceDep,
    _limiter: LimiterDep,
) -> MessageResponse:
    message = await service.forgot_password(dto.email)
    return MessageResponse(message=message)


@router.post(
    "/password/reset",
    status_code=status.HTTP_200_OK,
    response_model=MessageResponse,
    summary="Reset password with an emailed code",
)
async def reset_password(
    dto: PasswordResetRequest,
    service: AuthServiceDep,
    _limiter: LimiterDep,
) -> MessageResponse:
    message = await service.reset_password(dto)
    return MessageResponse(message=message)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Log out one refresh-token family",
)
async def logout(dto: LogoutRequest, service: AuthServiceDep) -> Response:
    await service.logout(dto.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/logout-all",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Log out all sessions",
)
async def logout_all(user: CurrentUserDep, service: AuthServiceDep) -> Response:
    await service.logout_all(user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/google",
    status_code=status.HTTP_200_OK,
    response_model=LoginResponse,
    summary="Log in with Google",
)
async def google(
    dto: GoogleIdTokenRequest,
    service: AuthServiceDep,
    ctx: RequestContextDep,
    _limiter: LimiterDep,
) -> LoginResponse:
    return await service.google(dto.id_token, ctx)


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get the current authenticated user",
)
async def me(user: CurrentUserDep, service: AuthServiceDep) -> MeResponse:
    return await service.me(user.id)


@router.post(
    "/link/google",
    status_code=status.HTTP_200_OK,
    response_model=MeResponse,
    summary="Link Google to the current account",
)
async def link_google(
    dto: GoogleIdTokenRequest,
    user: CurrentUserDep,
    service: AuthServiceDep,
) -> MeResponse:
    return await service.link_google(user.id, dto.id_token)


@router.delete(
    "/link/google",
    status_code=status.HTTP_200_OK,
    response_model=MeResponse,
    summary="Unlink Google from the current account",
)
async def unlink_google(user: CurrentUserDep, service: AuthServiceDep) -> MeResponse:
    _ = GENERIC_REGISTER_MESSAGE  # keep import used — module re-export for tests
    return await service.unlink_google(user.id)
