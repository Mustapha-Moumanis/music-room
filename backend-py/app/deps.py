"""Shared FastAPI dependencies.

Keeps the dependency graph explicit (session, settings, mail, auth guard, request context)
so services and routers never import each other through hidden singletons.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.jwt import InvalidAccessToken, verify_access_token
from app.db.base import get_session
from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User
from app.mail.service import MailService, get_mail_service
from app.middleware.client_info import ClientInfo, extract_client_info
from app.modules.auth.errors import auth_error
from app.modules.auth.google import GoogleIdTokenVerifier
from app.modules.auth.service import AuthService, RequestContext
from app.settings import Settings, get_settings

_bearer_scheme = HTTPBearer(auto_error=False, bearerFormat="JWT", scheme_name="BearerAuth")


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str
    session_id: str


SettingsDep = Annotated[Settings, Depends(get_settings)]
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_mail(settings: SettingsDep) -> MailService:
    return get_mail_service(settings)


MailDep = Annotated[MailService, Depends(get_mail)]


def get_google_verifier(settings: SettingsDep) -> GoogleIdTokenVerifier:
    return GoogleIdTokenVerifier(settings)


GoogleVerifierDep = Annotated[GoogleIdTokenVerifier, Depends(get_google_verifier)]


def get_client_info(request: Request) -> ClientInfo:
    return extract_client_info(dict(request.headers))


ClientInfoDep = Annotated[ClientInfo, Depends(get_client_info)]


def get_request_context(
    request: Request,
    client_info: ClientInfoDep,
    user_agent: Annotated[str | None, Header(alias="user-agent")] = None,
) -> RequestContext:
    ip = request.client.host if request.client else None
    return RequestContext(client_info=client_info, ip=ip, user_agent=user_agent)


RequestContextDep = Annotated[RequestContext, Depends(get_request_context)]


def get_auth_service(
    session: SessionDep,
    settings: SettingsDep,
    mail: MailDep,
    google: GoogleVerifierDep,
) -> AuthService:
    return AuthService(session, settings, mail, google)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


async def _resolve_user(
    credentials: HTTPAuthorizationCredentials | None,
    settings: Settings,
    session: AsyncSession,
) -> AuthenticatedUser | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    try:
        claims = verify_access_token(settings, credentials.credentials)
    except InvalidAccessToken:
        return None

    # Session must still be live: any non-revoked token in the family keeps the session valid.
    active = await session.scalar(
        select(RefreshToken).where(
            RefreshToken.family_id == claims["sid"],
            RefreshToken.revoked_at.is_(None),
        )
    )
    if active is None:
        return None
    user = await session.scalar(select(User).where(User.id == active.user_id))
    if user is None:
        return None
    return AuthenticatedUser(id=user.id, email=user.email, session_id=claims["sid"])


async def get_current_user(
    settings: SettingsDep,
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)] = None,
) -> AuthenticatedUser:
    user = await _resolve_user(credentials, settings, session)
    if user is None:
        # Pre-token guard failures also surface the SESSION_REVOKED code when the JWT
        # was valid but the family is dead — mirror jwt-auth.guard.ts behaviour: both
        # paths return 401 UNAUTHORIZED, but the service layer surfaces SESSION_REVOKED
        # when it's a stale session. Keeping the simple shape: always UNAUTHORIZED here.
        raise auth_error("UNAUTHORIZED", 401)
    return user


CurrentUserDep = Annotated[AuthenticatedUser, Depends(get_current_user)]


async def get_optional_user(
    settings: SettingsDep,
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)] = None,
) -> AuthenticatedUser | None:
    return await _resolve_user(credentials, settings, session)


OptionalUserDep = Annotated[AuthenticatedUser | None, Depends(get_optional_user)]
