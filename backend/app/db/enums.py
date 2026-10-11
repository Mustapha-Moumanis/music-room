"""Enum values mirror backend/prisma/schema.prisma one-for-one.

Changing any member here is a breaking DB migration — Postgres enums are typed.
"""

from __future__ import annotations

import enum


class IdentityProvider(enum.StrEnum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"


class EmailTokenType(enum.StrEnum):
    VERIFY_EMAIL = "VERIFY_EMAIL"
    RESET_PASSWORD = "RESET_PASSWORD"


class FriendshipStatus(enum.StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"


class ProfileVisibility(enum.StrEnum):
    PUBLIC = "PUBLIC"
    FRIENDS = "FRIENDS"
    PRIVATE = "PRIVATE"


class TrackProvider(enum.StrEnum):
    DEEZER = "DEEZER"


class ResourceVisibility(enum.StrEnum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"


class EventLicense(enum.StrEnum):
    EVERYONE = "EVERYONE"
    INVITED = "INVITED"
    LOCATION_TIME = "LOCATION_TIME"


class PlaylistLicense(enum.StrEnum):
    EVERYONE = "EVERYONE"
    INVITED = "INVITED"


class EventStatus(enum.StrEnum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"
    CANCELLED = "CANCELLED"


class EventTrackStatus(enum.StrEnum):
    QUEUED = "QUEUED"
    PLAYING = "PLAYING"
    PLAYED = "PLAYED"


class ActionLogKind(enum.StrEnum):
    HTTP = "HTTP"
    SOCKET = "SOCKET"
    CLIENT = "CLIENT"
