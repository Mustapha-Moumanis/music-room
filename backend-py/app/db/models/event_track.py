from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import EventTrackStatus

if TYPE_CHECKING:
    from app.db.models.event import Event
    from app.db.models.track import Track
    from app.db.models.user import User
    from app.db.models.vote import Vote


event_track_status_enum = PgEnum(
    EventTrackStatus, name="EventTrackStatus", create_type=False, native_enum=True
)


class EventTrack(IdMixin, TimestampMixin, Base):
    __tablename__ = "EventTrack"

    event_id: Mapped[str] = mapped_column(
        "eventId", String, ForeignKey("Event.id", ondelete="CASCADE"), nullable=False
    )
    track_id: Mapped[str] = mapped_column(
        "trackId", String, ForeignKey("Track.id", ondelete="CASCADE"), nullable=False
    )
    suggested_by_id: Mapped[str] = mapped_column(
        "suggestedById", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    vote_count: Mapped[int] = mapped_column(
        "voteCount", Integer, nullable=False, default=0, server_default="0"
    )
    status: Mapped[EventTrackStatus] = mapped_column(
        event_track_status_enum,
        nullable=False,
        default=EventTrackStatus.QUEUED,
        server_default="QUEUED",
    )
    played_at: Mapped[datetime | None] = mapped_column(
        "playedAt", DateTime(timezone=False), nullable=True
    )

    event: Mapped[Event] = relationship("Event", back_populates="tracks", foreign_keys=[event_id])
    track: Mapped[Track] = relationship(back_populates="event_tracks")
    suggested_by: Mapped[User] = relationship(back_populates="suggested_tracks")
    votes: Mapped[list[Vote]] = relationship(
        back_populates="event_track", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("eventId", "trackId", name="EventTrack_eventId_trackId_key"),
        Index(
            "EventTrack_eventId_status_voteCount_createdAt_idx",
            "eventId",
            "status",
            text('"voteCount" DESC'),
            "createdAt",
        ),
        Index("EventTrack_trackId_idx", "trackId"),
        Index("EventTrack_suggestedById_idx", "suggestedById"),
    )
