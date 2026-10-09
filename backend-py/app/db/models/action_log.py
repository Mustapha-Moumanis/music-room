from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.enums import ActionLogKind

if TYPE_CHECKING:
    from app.db.models.user import User


action_log_kind_enum = PgEnum(
    ActionLogKind, name="ActionLogKind", create_type=False, native_enum=True
)


class ActionLog(Base):
    __tablename__ = "ActionLog"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(
        "userId",
        String,
        ForeignKey("User.id", ondelete="SET NULL"),
        nullable=True,
    )
    kind: Mapped[ActionLogKind] = mapped_column(action_log_kind_enum, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str | None] = mapped_column(String, nullable=True)
    route: Mapped[str | None] = mapped_column(String, nullable=True)
    status_code: Mapped[int | None] = mapped_column("statusCode", Integer, nullable=True)
    platform: Mapped[str] = mapped_column(String, nullable=False)
    device: Mapped[str] = mapped_column(String, nullable=False)
    app_version: Mapped[str] = mapped_column("appVersion", String, nullable=False)
    request_id: Mapped[str | None] = mapped_column("requestId", String, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column("durationMs", Integer, nullable=True)
    ip: Mapped[str | None] = mapped_column(String, nullable=True)
    meta: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped[User | None] = relationship(back_populates="action_logs")

    __table_args__ = (
        Index("ActionLog_userId_createdAt_idx", "userId", "createdAt"),
        Index("ActionLog_createdAt_idx", "createdAt"),
        Index("ActionLog_kind_createdAt_idx", "kind", "createdAt"),
        Index("ActionLog_route_idx", "route"),
    )
