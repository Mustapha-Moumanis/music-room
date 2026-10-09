"""Auth service — port of backend/src/modules/auth/auth.service.ts.

Preserves the exact behaviour the NestJS tests pin:
- Generic responses on register/resend/forgot so an attacker can't enumerate accounts.
- A dummy argon2 hash is verified on login when the email is unknown, so timing is uniform.
- Refresh token rotation does `SELECT ... FOR UPDATE` inside a transaction, flags
  reuse by marking the whole family revoked, and emits REFRESH_TOKEN_REUSED on retry.
- Password reset increments an attempt counter atomically and burns the token after
  MAX_RESET_ATTEMPTS so brute force is bounded.
- Google sign-in handles the race where two parallel calls both create a new user.
"""

from __future__ import annotations

import contextlib
from dataclasses import dataclass
from datetime import UTC, datetime
from html import escape as html_escape

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.jwt import (
    hash_refresh_secret,
    issue_refresh_token,
    new_family_id,
    parse_refresh_token,
    sign_access_token,
)
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    hash_password,
    hmac_sha256_base64url,
    parse_ttl,
    random_numeric_code,
    safe_equal,
    verify_password,
)
from app.db.enums import EmailTokenType, IdentityProvider
from app.db.models.email_token import EmailToken
from app.db.models.identity import Identity
from app.db.models.profile import Profile
from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User
from app.mail.service import MailPayload, MailService
from app.middleware.client_info import ClientInfo
from app.modules.auth.errors import auth_error
from app.modules.auth.google import (
    GoogleIdTokenVerificationError,
    GoogleIdTokenVerifier,
)
from app.modules.auth.notifier import hash_email_token, send_verification_email
from app.modules.auth.password_policy import normalize_email, validate_password_policy
from app.modules.auth.schemas import (
    LoginRequest,
    LoginResponse,
    LoginUser,
    MeResponse,
    PasswordResetRequest,
    RefreshResponse,
    RegisterRequest,
)
from app.settings import Settings

GENERIC_REGISTER_MESSAGE = "If the address can be used, a verification email has been sent."
GENERIC_RESEND_MESSAGE = (
    "If the account exists and needs verification, a verification email has been sent."
)
GENERIC_FORGOT_MESSAGE = "If the account exists, a password reset code has been sent."
PASSWORD_RESET_MESSAGE = "Password has been reset."
MAX_RESET_ATTEMPTS = 5


@dataclass(frozen=True)
class RequestContext:
    """Request-scoped side-info the service threads into refresh-token rows."""

    client_info: ClientInfo
    ip: str | None
    user_agent: str | None


class AuthService:
    def __init__(
        self,
        session: AsyncSession,
        settings: Settings,
        mail: MailService,
        google_verifier: GoogleIdTokenVerifier,
    ) -> None:
        self._session = session
        self._settings = settings
        self._mail = mail
        self._google = google_verifier

    # ---------- register / verify / resend --------------------------------------

    async def register(self, dto: RegisterRequest) -> str:
        email = normalize_email(dto.email)
        if not validate_password_policy(dto.password, email):
            raise auth_error("WEAK_PASSWORD", 400)
        password_hash = hash_password(dto.password)

        existing = await self._session.scalar(select(User.id).where(User.email == email))
        if existing is not None:
            return GENERIC_REGISTER_MESSAGE

        try:
            user = User(
                email=email,
                password_hash=password_hash,
                display_name=dto.display_name,
            )
            user.identities.append(Identity(provider=IdentityProvider.LOCAL, provider_id=email))
            user.profile = Profile()
            self._session.add(user)
            await self._session.flush()
            await send_verification_email(
                settings=self._settings,
                mail=self._mail,
                session=self._session,
                user_id=user.id,
                email=user.email,
                display_name=user.display_name,
            )
            await self._session.commit()
        except IntegrityError:
            await self._session.rollback()
            return GENERIC_REGISTER_MESSAGE
        return GENERIC_REGISTER_MESSAGE

    async def verify_email(self, token: str | None) -> tuple[int, str]:
        if not token:
            return 400, _verification_html(False)
        now = datetime.now(UTC).replace(tzinfo=None)
        token_hash = hash_email_token(token)

        async with self._session.begin():
            row = await self._session.scalar(
                select(EmailToken)
                .where(
                    EmailToken.type == EmailTokenType.VERIFY_EMAIL,
                    EmailToken.token_hash == token_hash,
                )
                .with_for_update()
            )
            if row is None or row.used_at is not None or row.expires_at <= now:
                return 400, _verification_html(False)
            row.used_at = now
            await self._session.execute(
                update(User).where(User.id == row.user_id).values(email_verified_at=now)
            )
        return 200, _verification_html(True)

    async def resend_verification(self, email: str) -> str:
        normalized = normalize_email(email)
        user = await self._session.scalar(select(User).where(User.email == normalized))
        if user and user.password_hash and user.email_verified_at is None:
            await self._session.execute(
                update(EmailToken)
                .where(
                    EmailToken.user_id == user.id,
                    EmailToken.type == EmailTokenType.VERIFY_EMAIL,
                    EmailToken.used_at.is_(None),
                )
                .values(used_at=datetime.now(UTC).replace(tzinfo=None))
            )
            await send_verification_email(
                settings=self._settings,
                mail=self._mail,
                session=self._session,
                user_id=user.id,
                email=user.email,
                display_name=user.display_name,
            )
            await self._session.commit()
        return GENERIC_RESEND_MESSAGE

    # ---------- login / refresh / sessions --------------------------------------

    async def login(self, dto: LoginRequest, ctx: RequestContext) -> LoginResponse:
        email = normalize_email(dto.email)
        user = await self._session.scalar(select(User).where(User.email == email))
        hash_to_check = user.password_hash if user and user.password_hash else DUMMY_PASSWORD_HASH
        valid = verify_password(hash_to_check, dto.password)
        if not user or not user.password_hash or not valid:
            raise auth_error("INVALID_CREDENTIALS", 401)
        if user.email_verified_at is None:
            raise auth_error("EMAIL_NOT_VERIFIED", 403)
        return await self._issue_session(user, ctx)

    async def refresh(self, refresh_token: str, ctx: RequestContext) -> RefreshResponse:
        parsed = parse_refresh_token(refresh_token)
        if parsed is None:
            raise auth_error("INVALID_REFRESH_TOKEN", 401)
        secret_hash = hash_refresh_secret(parsed.secret)
        now = datetime.now(UTC).replace(tzinfo=None)

        reused = False
        issued = None
        async with self._session.begin():
            current = await self._session.scalar(
                select(RefreshToken).where(RefreshToken.id == parsed.id).with_for_update()
            )
            if current is None:
                raise auth_error("INVALID_REFRESH_TOKEN", 401)
            if not safe_equal(current.token_hash, secret_hash):
                raise auth_error("INVALID_REFRESH_TOKEN", 401)
            if current.expires_at <= now:
                raise auth_error("INVALID_REFRESH_TOKEN", 401)
            if current.revoked_at is not None or current.replaced_by_id is not None:
                await self._session.execute(
                    update(RefreshToken)
                    .where(
                        RefreshToken.family_id == current.family_id,
                        RefreshToken.revoked_at.is_(None),
                    )
                    .values(revoked_at=now)
                )
                reused = True
            else:
                issued = issue_refresh_token(self._settings)
                self._session.add(
                    RefreshToken(
                        id=issued.id,
                        token_hash=issued.secret_hash,
                        family_id=current.family_id,
                        user_id=current.user_id,
                        expires_at=issued.expires_at.replace(tzinfo=None),
                        user_agent=ctx.user_agent,
                        device=ctx.client_info.device,
                        ip=ctx.ip,
                    )
                )
                # Flush before the FK-dependent UPDATE on `current` so Postgres sees the
                # new row exists when we point `current.replacedById` at it.
                await self._session.flush()
                current.replaced_by_id = issued.id
                access = sign_access_token(self._settings, current.user_id, current.family_id)
                return RefreshResponse(
                    access_token=access.access_token,
                    access_token_expires_in=access.access_token_expires_in,
                    refresh_token=issued.token,
                    refresh_token_expires_at=_iso(issued.expires_at),
                )

        if reused:
            raise auth_error("REFRESH_TOKEN_REUSED", 401)
        # Unreachable — issued returns above, reused raises. Appeases mypy.
        raise auth_error("INVALID_REFRESH_TOKEN", 401)

    async def logout(self, refresh_token: str) -> None:
        parsed = parse_refresh_token(refresh_token)
        if parsed is None:
            return
        token = await self._session.scalar(select(RefreshToken).where(RefreshToken.id == parsed.id))
        if token is None or not safe_equal(token.token_hash, hash_refresh_secret(parsed.secret)):
            return
        now = datetime.now(UTC).replace(tzinfo=None)
        await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.family_id == token.family_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await self._session.commit()

    async def logout_all(self, user_id: str) -> None:
        now = datetime.now(UTC).replace(tzinfo=None)
        await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await self._session.commit()

    # ---------- password reset --------------------------------------------------

    async def forgot_password(self, email: str) -> str:
        normalized = normalize_email(email)
        user = await self._session.scalar(select(User).where(User.email == normalized))
        if user is None or not user.password_hash:
            return GENERIC_FORGOT_MESSAGE

        code = random_numeric_code(6)
        expires_at = datetime.now(UTC) + parse_ttl(self._settings.PASSWORD_RESET_TTL)
        async with self._session.begin():
            await self._session.execute(
                update(EmailToken)
                .where(
                    EmailToken.user_id == user.id,
                    EmailToken.type == EmailTokenType.RESET_PASSWORD,
                    EmailToken.used_at.is_(None),
                )
                .values(used_at=datetime.now(UTC).replace(tzinfo=None))
            )
            self._session.add(
                EmailToken(
                    user_id=user.id,
                    type=EmailTokenType.RESET_PASSWORD,
                    token_hash=self._hash_reset_code(normalized, code),
                    expires_at=expires_at.replace(tzinfo=None),
                )
            )

        with contextlib.suppress(Exception):
            await self._mail.send(
                MailPayload(
                    to=user.email,
                    subject="Your Music Room password reset code",
                    text=(
                        f"Hi {user.display_name},\n\n"
                        f"Your Music Room password reset code is {code}.\n\n"
                        "It expires in 15 minutes."
                    ),
                    html=(
                        f"<p>Hi {html_escape(user.display_name)},</p>"
                        f"<p>Your Music Room password reset code is <strong>{code}</strong>.</p>"
                        "<p>It expires in 15 minutes.</p>"
                    ),
                )
            )
        return GENERIC_FORGOT_MESSAGE

    async def reset_password(self, dto: PasswordResetRequest) -> str:
        email = normalize_email(dto.email)
        if not validate_password_policy(dto.new_password, email):
            raise auth_error("WEAK_PASSWORD", 400)
        # Hash the new password before the DB lookup so timing is identical for known/unknown
        # emails — mirrors auth.service.ts:206.
        new_hash = hash_password(dto.new_password)
        user_id = await self._session.scalar(select(User.id).where(User.email == email))
        if user_id is None:
            raise auth_error("INVALID_RESET_CODE", 400)

        now = datetime.now(UTC).replace(tzinfo=None)
        expected_hash = self._hash_reset_code(email, dto.code)

        token = (
            await self._session.execute(
                select(EmailToken)
                .where(
                    EmailToken.user_id == user_id,
                    EmailToken.type == EmailTokenType.RESET_PASSWORD,
                    EmailToken.used_at.is_(None),
                    EmailToken.expires_at > now,
                )
                .order_by(EmailToken.created_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        if token is None:
            raise auth_error("INVALID_RESET_CODE", 400)

        claim = await self._session.execute(
            update(EmailToken)
            .where(
                EmailToken.id == token.id,
                EmailToken.used_at.is_(None),
                EmailToken.attempts < MAX_RESET_ATTEMPTS,
            )
            .values(attempts=EmailToken.attempts + 1)
        )
        if claim.rowcount != 1 or not safe_equal(token.token_hash, expected_hash):
            await self._session.execute(
                update(EmailToken)
                .where(
                    EmailToken.id == token.id,
                    EmailToken.used_at.is_(None),
                    EmailToken.attempts >= MAX_RESET_ATTEMPTS,
                )
                .values(used_at=now)
            )
            await self._session.commit()
            raise auth_error("INVALID_RESET_CODE", 400)

        async with self._session.begin_nested():
            consumed = await self._session.execute(
                update(EmailToken)
                .where(EmailToken.id == token.id, EmailToken.used_at.is_(None))
                .values(used_at=now)
            )
            if consumed.rowcount != 1:
                raise auth_error("INVALID_RESET_CODE", 400)
            await self._session.execute(
                update(User)
                .where(User.id == user_id)
                .values(password_hash=new_hash, email_verified_at=now)
            )
            await self._session.execute(
                update(RefreshToken)
                .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
                .values(revoked_at=now)
            )
        await self._session.commit()
        return PASSWORD_RESET_MESSAGE

    # ---------- me / Google link / unlink ---------------------------------------

    async def me(self, user_id: str) -> MeResponse:
        user = await self._session.scalar(
            select(User).where(User.id == user_id).options(selectinload(User.identities))
        )
        if user is None:
            raise auth_error("UNAUTHORIZED", 401)
        return _to_me(user)

    async def google(self, raw_id_token: str, ctx: RequestContext) -> LoginResponse:
        claims = await self._verify_google(raw_id_token)
        identity = await self._session.scalar(
            select(Identity).where(
                Identity.provider == IdentityProvider.GOOGLE,
                Identity.provider_id == claims.sub,
            )
        )
        if identity is not None:
            user = await self._session.scalar(select(User).where(User.id == identity.user_id))
            if user is None:
                raise auth_error("UNAUTHORIZED", 401)
            return await self._issue_session(user, ctx)

        email = normalize_email(claims.email)
        existing = await self._session.scalar(select(User.id).where(User.email == email))
        if existing is not None:
            raise auth_error("ACCOUNT_EXISTS_LINK_REQUIRED", 409)

        display_name = (claims.name or "").strip() or email.split("@", 1)[0]
        try:
            user = User(
                email=email,
                display_name=display_name,
                email_verified_at=datetime.now(UTC).replace(tzinfo=None),
            )
            user.identities.append(
                Identity(provider=IdentityProvider.GOOGLE, provider_id=claims.sub)
            )
            user.profile = Profile()
            self._session.add(user)
            await self._session.flush()
            session = await self._issue_session(user, ctx)
            await self._session.commit()
            return session
        except IntegrityError:
            await self._session.rollback()
            raced = await self._session.scalar(
                select(Identity).where(
                    Identity.provider == IdentityProvider.GOOGLE,
                    Identity.provider_id == claims.sub,
                )
            )
            if raced is not None:
                raced_user = await self._session.scalar(
                    select(User).where(User.id == raced.user_id)
                )
                if raced_user is not None:
                    return await self._issue_session(raced_user, ctx)
            raise auth_error("ACCOUNT_EXISTS_LINK_REQUIRED", 409) from None

    async def link_google(self, user_id: str, raw_id_token: str) -> MeResponse:
        claims = await self._verify_google(raw_id_token)
        existing = await self._session.scalar(
            select(Identity).where(
                Identity.provider == IdentityProvider.GOOGLE,
                Identity.provider_id == claims.sub,
            )
        )
        if existing is not None and existing.user_id != user_id:
            raise auth_error("GOOGLE_ALREADY_LINKED", 409)
        if existing is None:
            try:
                self._session.add(
                    Identity(
                        provider=IdentityProvider.GOOGLE,
                        provider_id=claims.sub,
                        user_id=user_id,
                    )
                )
                await self._session.commit()
            except IntegrityError:
                await self._session.rollback()
                raise auth_error("GOOGLE_ALREADY_LINKED", 409) from None
        return await self.me(user_id)

    async def unlink_google(self, user_id: str) -> MeResponse:
        user = await self._session.scalar(
            select(User).where(User.id == user_id).options(selectinload(User.identities))
        )
        if user is None:
            raise auth_error("UNAUTHORIZED", 401)
        google = next((i for i in user.identities if i.provider == IdentityProvider.GOOGLE), None)
        if google is None:
            raise auth_error("GOOGLE_NOT_LINKED", 404)
        if not user.password_hash:
            raise auth_error("PASSWORD_REQUIRED_TO_UNLINK", 400)
        await self._session.delete(google)
        await self._session.commit()
        return await self.me(user_id)

    # ---------- helpers ---------------------------------------------------------

    async def _issue_session(self, user: User, ctx: RequestContext) -> LoginResponse:
        family_id = new_family_id()
        refresh = issue_refresh_token(self._settings)
        self._session.add(
            RefreshToken(
                id=refresh.id,
                token_hash=refresh.secret_hash,
                family_id=family_id,
                user_id=user.id,
                expires_at=refresh.expires_at.replace(tzinfo=None),
                user_agent=ctx.user_agent,
                device=ctx.client_info.device,
                ip=ctx.ip,
            )
        )
        await self._session.commit()
        access = sign_access_token(self._settings, user.id, family_id)
        return LoginResponse(
            access_token=access.access_token,
            access_token_expires_in=access.access_token_expires_in,
            refresh_token=refresh.token,
            refresh_token_expires_at=_iso(refresh.expires_at),
            user=LoginUser(id=user.id, email=user.email, display_name=user.display_name),
        )

    def _hash_reset_code(self, email: str, code: str) -> str:
        return hmac_sha256_base64url(self._settings.JWT_REFRESH_SECRET, f"{email}:{code}")

    async def _verify_google(self, raw_id_token: str):
        try:
            return await self._google.verify(raw_id_token)
        except GoogleIdTokenVerificationError as exc:
            raise auth_error("INVALID_GOOGLE_TOKEN", 401) from exc


def _to_me(user: User) -> MeResponse:
    return MeResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        email_verified=user.email_verified_at is not None,
        has_password=bool(user.password_hash),
        providers=sorted({i.provider for i in user.identities}, key=lambda p: p.value),
    )


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _verification_html(ok: bool) -> str:
    title = "Email verified" if ok else "Verification link invalid"
    message = (
        "Email verified — you can go back to the Music Room app and log in."
        if ok
        else "This verification link is invalid, expired, or has already been used."
    )
    # Byte-identical to backend/src/modules/auth/auth.service.ts:verificationHtml.
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f"<title>{title}</title>"
        '<style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;'
        "margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f4;color:#20201d}"
        ".box{max-width:34rem;padding:2rem;text-align:center}h1{font-size:1.75rem;margin:0 0 1rem}"
        "p{line-height:1.5;margin:0}</style></head><body>"
        f'<main class="box"><h1>{title}</h1><p>{message}</p></main></body></html>'
    )


__all__ = [
    "GENERIC_FORGOT_MESSAGE",
    "GENERIC_REGISTER_MESSAGE",
    "GENERIC_RESEND_MESSAGE",
    "PASSWORD_RESET_MESSAGE",
    "AuthService",
    "RequestContext",
]
