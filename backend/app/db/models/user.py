from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.action_log import ActionLog
    from app.db.models.email_token import EmailToken
    from app.db.models.event import Event
    from app.db.models.event_invite import EventInvite
    from app.db.models.event_track import EventTrack
    from app.db.models.friendship import Friendship
    from app.db.models.identity import Identity
    from app.db.models.playlist import Playlist
    from app.db.models.playlist_member import PlaylistMember
    from app.db.models.playlist_track import PlaylistTrack
    from app.db.models.profile import Profile
    from app.db.models.refresh_token import RefreshToken
    from app.db.models.vote import Vote


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "User"

    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column("passwordHash", String, nullable=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(
        "emailVerifiedAt", DateTime(timezone=False), nullable=True
    )
    display_name: Mapped[str] = mapped_column("displayName", String, nullable=False)

    identities: Mapped[list[Identity]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    email_tokens: Mapped[list[EmailToken]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    profile: Mapped[Profile | None] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    sent_friendships: Mapped[list[Friendship]] = relationship(
        "Friendship",
        back_populates="requester",
        foreign_keys="Friendship.requester_id",
        cascade="all, delete-orphan",
    )
    received_friendships: Mapped[list[Friendship]] = relationship(
        "Friendship",
        back_populates="addressee",
        foreign_keys="Friendship.addressee_id",
        cascade="all, delete-orphan",
    )
    owned_events: Mapped[list[Event]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    event_invites: Mapped[list[EventInvite]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    suggested_tracks: Mapped[list[EventTrack]] = relationship(
        back_populates="suggested_by", cascade="all, delete-orphan"
    )
    votes: Mapped[list[Vote]] = relationship(back_populates="user", cascade="all, delete-orphan")
    owned_playlists: Mapped[list[Playlist]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    playlist_members: Mapped[list[PlaylistMember]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    added_playlist_tracks: Mapped[list[PlaylistTrack]] = relationship(
        back_populates="added_by", cascade="all, delete-orphan"
    )
    action_logs: Mapped[list[ActionLog]] = relationship(back_populates="user")

    __table_args__ = (Index("User_email_idx", "email"),)
