"""Friends module DTOs."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Relationship = Literal["SELF", "FRIENDS", "REQUEST_SENT", "REQUEST_RECEIVED", "NONE"]
RELATIONSHIPS: tuple[Relationship, ...] = (
    "SELF",
    "FRIENDS",
    "REQUEST_SENT",
    "REQUEST_RECEIVED",
    "NONE",
)


class _Base(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class UserSummary(_Base):
    id: str
    display_name: str = Field(alias="displayName", serialization_alias="displayName")
    avatar_url: str | None = Field(alias="avatarUrl", serialization_alias="avatarUrl")


class Friend(UserSummary):
    since: datetime = Field(description="When the friendship was accepted")


class FriendRequest(_Base):
    user: UserSummary
    created_at: datetime = Field(alias="createdAt", serialization_alias="createdAt")


class FriendRequests(_Base):
    incoming: list[FriendRequest]
    outgoing: list[FriendRequest]


class RelationshipResponse(_Base):
    user_id: str = Field(alias="userId", serialization_alias="userId")
    relationship: Relationship
