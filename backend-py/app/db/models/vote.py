from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin

if TYPE_CHECKING:
    from app.db.models.event_track import EventTrack
    from app.db.models.user import User


class Vote(IdMixin, Base):
    __tablename__ = "Vote"

    event_track_id: Mapped[str] = mapped_column(
        "eventTrackId", String, ForeignKey("EventTrack.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        "userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    event_track: Mapped[EventTrack] = relationship(back_populates="votes")
    user: Mapped[User] = relationship(back_populates="votes")

    __table_args__ = (
        UniqueConstraint("eventTrackId", "userId", name="Vote_eventTrackId_userId_key"),
        Index("Vote_userId_idx", "userId"),
    )
