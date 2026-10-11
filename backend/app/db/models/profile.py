from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.db.enums import ProfileVisibility

if TYPE_CHECKING:
    from app.db.models.user import User


profile_visibility_enum = PgEnum(
    ProfileVisibility, name="ProfileVisibility", create_type=False, native_enum=True
)


class Profile(IdMixin, TimestampMixin, Base):
    __tablename__ = "Profile"

    user_id: Mapped[str] = mapped_column(
        "userId",
        String,
        ForeignKey("User.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    bio: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column("avatarUrl", String, nullable=True)
    real_name: Mapped[str | None] = mapped_column("realName", String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    birth_date: Mapped[date | None] = mapped_column("birthDate", Date, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    music_genres: Mapped[list[str]] = mapped_column(
        "musicGenres", ARRAY(String), nullable=False, server_default="{}"
    )
    music_tags: Mapped[list[str]] = mapped_column(
        "musicTags", ARRAY(String), nullable=False, server_default="{}"
    )
    music_visibility: Mapped[ProfileVisibility] = mapped_column(
        "musicVisibility",
        profile_visibility_enum,
        nullable=False,
        default=ProfileVisibility.PUBLIC,
        server_default="PUBLIC",
    )

    user: Mapped[User] = relationship(back_populates="profile")
