from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Index, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import TrackProvider

if TYPE_CHECKING:
    from app.db.models.event_track import EventTrack
    from app.db.models.playlist_track import PlaylistTrack


track_provider_enum = PgEnum(
    TrackProvider, name="TrackProvider", create_type=False, native_enum=True
)


class Track(IdMixin, TimestampMixin, Base):
    __tablename__ = "Track"

    provider: Mapped[TrackProvider] = mapped_column(track_provider_enum, nullable=False)
    provider_track_id: Mapped[str] = mapped_column("providerTrackId", String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    artist: Mapped[str] = mapped_column(String, nullable=False)
    album: Mapped[str | None] = mapped_column(String, nullable=True)
    duration_sec: Mapped[int | None] = mapped_column("durationSec", Integer, nullable=True)
    cover_url: Mapped[str | None] = mapped_column("coverUrl", String, nullable=True)
    preview_url: Mapped[str | None] = mapped_column("previewUrl", String, nullable=True)

    event_tracks: Mapped[list[EventTrack]] = relationship(
        back_populates="track", cascade="all, delete-orphan"
    )
    playlist_tracks: Mapped[list[PlaylistTrack]] = relationship(
        back_populates="track", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("provider", "providerTrackId", name="Track_provider_providerTrackId_key"),
        Index("Track_title_idx", "title"),
        Index("Track_artist_idx", "artist"),
    )
