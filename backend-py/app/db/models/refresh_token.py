from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.user import User


class RefreshToken(IdMixin, TimestampMixin, Base):
    __tablename__ = "RefreshToken"

    token_hash: Mapped[str] = mapped_column("tokenHash", String, unique=True, nullable=False)
    family_id: Mapped[str] = mapped_column("familyId", String, nullable=False)
    user_id: Mapped[str] = mapped_column(
        "userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        "expiresAt", DateTime(timezone=False), nullable=False
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        "revokedAt", DateTime(timezone=False), nullable=True
    )
    replaced_by_id: Mapped[str | None] = mapped_column(
        "replacedById",
        String,
        ForeignKey("RefreshToken.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column("userAgent", String, nullable=True)
    device: Mapped[str | None] = mapped_column(String, nullable=True)
    ip: Mapped[str | None] = mapped_column(String, nullable=True)

    user: Mapped[User] = relationship(back_populates="refresh_tokens")
    replaced_by: Mapped[RefreshToken | None] = relationship(
        "RefreshToken",
        remote_side="RefreshToken.id",
        foreign_keys=[replaced_by_id],
        post_update=True,
    )

    __table_args__ = (
        Index("RefreshToken_userId_idx", "userId"),
        Index("RefreshToken_familyId_idx", "familyId"),
        Index("RefreshToken_expiresAt_idx", "expiresAt"),
    )
