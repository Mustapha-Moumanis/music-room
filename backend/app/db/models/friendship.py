from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import FriendshipStatus

if TYPE_CHECKING:
    from app.db.models.user import User


friendship_status_enum = PgEnum(
    FriendshipStatus, name="FriendshipStatus", create_type=False, native_enum=True
)


class Friendship(IdMixin, TimestampMixin, Base):
    __tablename__ = "Friendship"

    requester_id: Mapped[str] = mapped_column(
        "requesterId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    addressee_id: Mapped[str] = mapped_column(
        "addresseeId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[FriendshipStatus] = mapped_column(
        friendship_status_enum,
        nullable=False,
        default=FriendshipStatus.PENDING,
        server_default="PENDING",
    )

    requester: Mapped[User] = relationship(
        "User", back_populates="sent_friendships", foreign_keys=[requester_id]
    )
    addressee: Mapped[User] = relationship(
        "User", back_populates="received_friendships", foreign_keys=[addressee_id]
    )

    __table_args__ = (
        UniqueConstraint(
            "requesterId", "addresseeId", name="Friendship_requesterId_addresseeId_key"
        ),
        Index("Friendship_requesterId_status_idx", "requesterId", "status"),
        Index("Friendship_addresseeId_status_idx", "addresseeId", "status"),
    )
