"""Email verification notifier.

Port of backend/src/modules/auth/email-verification-notifier.ts: generates a 32-byte
secret, stores the SHA256 of it as an EmailToken(VERIFY_EMAIL), and emails the user a
link that includes the plaintext token. Logs and swallows send failures so registration
and resend endpoints stay generic.
"""

from __future__ import annotations

from datetime import UTC, datetime
from html import escape as html_escape
from urllib.parse import quote

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.security import parse_ttl, random_token_urlsafe, sha256_base64url
from app.db.enums import EmailTokenType
from app.db.models.email_token import EmailToken
from app.mail.service import MailPayload, MailService
from app.settings import Settings

_logger = get_logger("email_verification")


def hash_email_token(token: str) -> str:
    return sha256_base64url(token)


async def send_verification_email(
    *,
    settings: Settings,
    mail: MailService,
    session: AsyncSession,
    user_id: str,
    email: str,
    display_name: str,
) -> None:
    try:
        token = random_token_urlsafe(32)
        token_hash = hash_email_token(token)
        expires_at = datetime.now(UTC) + parse_ttl(settings.EMAIL_VERIFY_TTL)
        session.add(
            EmailToken(
                type=EmailTokenType.VERIFY_EMAIL,
                token_hash=token_hash,
                user_id=user_id,
                expires_at=expires_at.replace(tzinfo=None),
            )
        )
        await session.flush()
        verify_url = f"{settings.APP_URL}/api/auth/verify?token={quote(token)}"
        safe_name = html_escape(display_name)
        safe_url = html_escape(verify_url)
        await mail.send(
            MailPayload(
                to=email,
                subject="Verify your Music Room email",
                text=(
                    f"Hi {display_name},\n\n"
                    f"Verify your Music Room email:\n{verify_url}\n\n"
                    "This link expires in 24 hours."
                ),
                html=(
                    f"<p>Hi {safe_name},</p>"
                    "<p>Verify your Music Room email:</p>"
                    f'<p><a href="{safe_url}">{safe_url}</a></p>'
                    "<p>This link expires in 24 hours.</p>"
                ),
            )
        )
    except Exception:
        _logger.exception("verification_email_send_failed", user_id=user_id)
