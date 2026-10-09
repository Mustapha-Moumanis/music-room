"""SMTP mail service with an in-memory sink for tests.

Mirrors backend/src/core/mail/mail.service.ts:
  - In NODE_ENV=test, no SMTP connection — mail is pushed to an in-memory list and
    the test suite inspects it (`get_sent_mail()`).
  - Otherwise, uses aiosmtplib directly (nodemailer-equivalent) with TLS when SMTP
    port is 465.

No templating engine. The two emails we send today are formatted inline from the
notifier modules (verify_email, password_reset) and passed in as (subject, text, html)
pairs — identical to the Nest service.
"""

from __future__ import annotations

import ssl
from dataclasses import dataclass
from email.message import EmailMessage

import aiosmtplib

from app.settings import Settings


@dataclass(frozen=True)
class MailPayload:
    to: str
    subject: str
    text: str
    html: str


@dataclass(frozen=True)
class SentMailRecord:
    to: str
    from_: str
    subject: str
    text: str
    html: str


class MailService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._sent: list[SentMailRecord] = []
        self._is_test = settings.NODE_ENV == "test"

    async def send(self, payload: MailPayload) -> None:
        record = SentMailRecord(
            to=payload.to,
            from_=self._settings.MAIL_FROM,
            subject=payload.subject,
            text=payload.text,
            html=payload.html,
        )
        if self._is_test:
            self._sent.append(record)
            return

        message = EmailMessage()
        message["From"] = self._settings.MAIL_FROM
        message["To"] = payload.to
        message["Subject"] = payload.subject
        message.set_content(payload.text)
        message.add_alternative(payload.html, subtype="html")

        port = self._settings.SMTP_PORT
        use_tls = port == 465
        auth: dict[str, str] = {}
        if self._settings.SMTP_USER and self._settings.SMTP_PASSWORD:
            auth = {
                "username": self._settings.SMTP_USER,
                "password": self._settings.SMTP_PASSWORD,
            }

        await aiosmtplib.send(
            message,
            hostname=self._settings.SMTP_HOST,
            port=port,
            use_tls=use_tls,
            tls_context=ssl.create_default_context() if use_tls else None,
            **auth,
        )

    def get_sent_mail(self) -> list[SentMailRecord]:
        return list(self._sent)

    def clear_sent_mail(self) -> None:
        self._sent.clear()


_instance: MailService | None = None


def get_mail_service(settings: Settings) -> MailService:
    global _instance
    if _instance is None:
        _instance = MailService(settings)
    return _instance


def reset_mail_service() -> None:
    """Testing hook — rebuilds the singleton against new settings."""
    global _instance
    _instance = None
