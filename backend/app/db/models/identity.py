from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import IdentityProvider

if TYPE_CHECKING:
    from app.db.models.user import User


identity_provider_enum = PgEnum(
    IdentityProvider, name="IdentityProvider", create_type=False, native_enum=True
)


class Identity(IdMixin, TimestampMixin, Base):
    __tablename__ = "Identity"

    provider: Mapped[IdentityProvider] = mapped_column(identity_provider_enum, nullable=False)
    provider_id: Mapped[str] = mapped_column("providerId", String, nullable=False)
    user_id: Mapped[str] = mapped_column(
        "userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="identities")

    __table_args__ = (
        UniqueConstraint("provider", "providerId", name="Identity_provider_providerId_key"),
        UniqueConstraint("provider", "userId", name="Identity_provider_userId_key"),
        Index("Identity_userId_idx", "userId"),
    )
