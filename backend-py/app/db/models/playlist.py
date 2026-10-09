from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import PlaylistLicense, ResourceVisibility

if TYPE_CHECKING:
    from app.db.models.playlist_member import PlaylistMember
    from app.db.models.playlist_track import PlaylistTrack
    from app.db.models.user import User


# Enum type objects are shared with Event (same name 'ResourceVisibility' in Postgres).
# Using create_type=False everywhere; the one that owns creation is set in the Alembic
# baseline migration (see alembic/versions/0001_baseline.py).
resource_visibility_enum = PgEnum(
    ResourceVisibility, name="ResourceVisibility", create_type=False, native_enum=True
)
playlist_license_enum = PgEnum(
    PlaylistLicense, name="PlaylistLicense", create_type=False, native_enum=True
)


class Playlist(IdMixin, TimestampMixin, Base):
    __tablename__ = "Playlist"

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
    license: Mapped[PlaylistLicense] = mapped_column(
        playlist_license_enum,
        nullable=False,
        default=PlaylistLicense.EVERYONE,
        server_default="EVERYONE",
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    owner: Mapped[User] = relationship(back_populates="owned_playlists")
    members: Mapped[list[PlaylistMember]] = relationship(
        back_populates="playlist", cascade="all, delete-orphan"
    )
    tracks: Mapped[list[PlaylistTrack]] = relationship(
        back_populates="playlist", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("Playlist_ownerId_idx", "ownerId"),
        Index("Playlist_visibility_idx", "visibility"),
    )
