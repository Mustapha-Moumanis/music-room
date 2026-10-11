from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin
from app.db.enums import EmailTokenType

if TYPE_CHECKING:
    from app.db.models.user import User


email_token_type_enum = PgEnum(
    EmailTokenType, name="EmailTokenType", create_type=False, native_enum=True
)


class EmailToken(IdMixin, Base):
    __tablename__ = "EmailToken"

    type: Mapped[EmailTokenType] = mapped_column(email_token_type_enum, nullable=False)
    token_hash: Mapped[str] = mapped_column("tokenHash", String, unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(
        "userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        "expiresAt", DateTime(timezone=False), nullable=False
    )
    used_at: Mapped[datetime | None] = mapped_column(
        "usedAt", DateTime(timezone=False), nullable=True
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="email_tokens")

    __table_args__ = (
        Index("EmailToken_userId_type_idx", "userId", "type"),
        Index("EmailToken_expiresAt_idx", "expiresAt"),
    )
