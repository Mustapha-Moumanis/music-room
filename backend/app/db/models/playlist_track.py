from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.playlist import Playlist
    from app.db.models.track import Track
    from app.db.models.user import User


class PlaylistTrack(IdMixin, TimestampMixin, Base):
    """Gap-ordered insertion: new row's `position = (prev + next) / 2`.

    When the gap drops below 2, service-layer code must renumber the whole playlist
    inside a `SELECT ... FOR UPDATE` transaction. The ORM layer only stores the number.
    """

    __tablename__ = "PlaylistTrack"

    playlist_id: Mapped[str] = mapped_column(
        "playlistId", String, ForeignKey("Playlist.id", ondelete="CASCADE"), nullable=False
    )
    track_id: Mapped[str] = mapped_column(
        "trackId", String, ForeignKey("Track.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    added_by_id: Mapped[str] = mapped_column(
        "addedById", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )

    playlist: Mapped[Playlist] = relationship(back_populates="tracks")
    track: Mapped[Track] = relationship(back_populates="playlist_tracks")
    added_by: Mapped[User] = relationship(back_populates="added_playlist_tracks")

    __table_args__ = (
        UniqueConstraint("playlistId", "trackId", name="PlaylistTrack_playlistId_trackId_key"),
        Index("PlaylistTrack_playlistId_position_idx", "playlistId", "position"),
        Index("PlaylistTrack_trackId_idx", "trackId"),
        Index("PlaylistTrack_addedById_idx", "addedById"),
    )
