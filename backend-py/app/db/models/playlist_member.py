from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.playlist import Playlist
    from app.db.models.user import User


class PlaylistMember(IdMixin, TimestampMixin, Base):
    __tablename__ = "PlaylistMember"

    playlist_id: Mapped[str] = mapped_column(
        "playlistId", String, ForeignKey("Playlist.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        "userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    can_edit: Mapped[bool] = mapped_column(
        "canEdit", Boolean, nullable=False, default=False, server_default="false"
    )

    playlist: Mapped[Playlist] = relationship(back_populates="members")
    user: Mapped[User] = relationship(back_populates="playlist_members")

    __table_args__ = (
        UniqueConstraint("playlistId", "userId", name="PlaylistMember_playlistId_userId_key"),
        Index("PlaylistMember_userId_idx", "userId"),
    )
