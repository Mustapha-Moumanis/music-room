from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin

if TYPE_CHECKING:
    from app.db.models.event import Event
    from app.db.models.user import User


class EventInvite(IdMixin, Base):
    __tablename__ = "EventInvite"

    event_id: Mapped[str] = mapped_column(
        "eventId", String, ForeignKey("Event.id", ondelete="CASCADE"), nullable=False
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

    event: Mapped[Event] = relationship(back_populates="invites")
    user: Mapped[User] = relationship(back_populates="event_invites")

    __table_args__ = (
        UniqueConstraint("eventId", "userId", name="EventInvite_eventId_userId_key"),
        Index("EventInvite_userId_idx", "userId"),
    )
