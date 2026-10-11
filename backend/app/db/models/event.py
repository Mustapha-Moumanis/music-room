from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import EventLicense, EventStatus, ResourceVisibility

if TYPE_CHECKING:
    from app.db.models.event_invite import EventInvite
    from app.db.models.event_track import EventTrack
    from app.db.models.user import User


resource_visibility_enum = PgEnum(
    ResourceVisibility, name="ResourceVisibility", create_type=False, native_enum=True
)
event_license_enum = PgEnum(EventLicense, name="EventLicense", create_type=False, native_enum=True)
event_status_enum = PgEnum(EventStatus, name="EventStatus", create_type=False, native_enum=True)


class Event(IdMixin, TimestampMixin, Base):
    __tablename__ = "Event"

    owner_id: Mapped[str] = mapped_column(
        "ownerId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    visibility: Mapped[ResourceVisibility] = mapped_column(
        resource_visibility_enum,
        nullable=False,
        default=ResourceVisibility.PUBLIC,
        server_default="PUBLIC",
    )
    license: Mapped[EventLicense] = mapped_column(
        event_license_enum,
        nullable=False,
        default=EventLicense.EVERYONE,
        server_default="EVERYONE",
    )
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    radius_meters: Mapped[int | None] = mapped_column("radiusMeters", Integer, nullable=True)
    starts_at: Mapped[datetime | None] = mapped_column(
        "startsAt", DateTime(timezone=False), nullable=True
    )
    ends_at: Mapped[datetime | None] = mapped_column(
        "endsAt", DateTime(timezone=False), nullable=True
    )
    timezone: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[EventStatus] = mapped_column(
        event_status_enum,
        nullable=False,
        default=EventStatus.DRAFT,
        server_default="DRAFT",
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    now_playing_event_track_id: Mapped[str | None] = mapped_column(
        "nowPlayingEventTrackId",
        String,
        ForeignKey(
            "EventTrack.id",
            ondelete="SET NULL",
            use_alter=True,
            name="Event_nowPlayingEventTrackId_fkey",
        ),
        unique=True,
        nullable=True,
    )

    owner: Mapped[User] = relationship(back_populates="owned_events")
    invites: Mapped[list[EventInvite]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    tracks: Mapped[list[EventTrack]] = relationship(
        "EventTrack",
        back_populates="event",
        cascade="all, delete-orphan",
        foreign_keys="EventTrack.event_id",
    )
    now_playing_event_track: Mapped[EventTrack | None] = relationship(
        "EventTrack",
        foreign_keys=[now_playing_event_track_id],
        post_update=True,
    )

    __table_args__ = (
        Index("Event_ownerId_idx", "ownerId"),
        Index("Event_visibility_status_idx", "visibility", "status"),
        Index("Event_startsAt_endsAt_idx", "startsAt", "endsAt"),
    )
