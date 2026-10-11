"""Users module DTOs.

The profile is a nested shape of four groups: `public`, `friends`, `private`, `music`.
Every group is optional on update; absent fields stay untouched, `None` clears a field.
"""

from __future__ import annotations

import re
from datetime import UTC, date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.db.enums import ProfileVisibility
from app.modules.friends.schemas import Relationship, UserSummary
from app.modules.users.constants import MUSIC_GENRES_SET, PROFILE_LIMITS

_PHONE_RE = re.compile(r"^\+?[0-9 ().-]{6,20}$")
_BIRTH_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_URL_RE = re.compile(r"^https?://[^\s]+$")
_MIN_BIRTH_DATE = date(1900, 1, 1)


class _Base(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


# --- read-side DTOs ------------------------------------------------------------


class PublicInfo(_Base):
    display_name: str = Field(alias="displayName", serialization_alias="displayName")
    bio: str | None
    avatar_url: str | None = Field(alias="avatarUrl", serialization_alias="avatarUrl")


class FriendsInfo(_Base):
    real_name: str | None = Field(alias="realName", serialization_alias="realName")
    city: str | None


class PrivateInfo(_Base):
    birth_date: str | None = Field(alias="birthDate", serialization_alias="birthDate")
    phone: str | None


class MusicPreferences(_Base):
    genres: list[str]
    tags: list[str]
    visibility: ProfileVisibility


class MyProfile(_Base):
    id: str
    email: str
    public: PublicInfo
    friends: FriendsInfo
    private: PrivateInfo
    music: MusicPreferences


class UserProfile(_Base):
    id: str
    relationship: Relationship
    public: PublicInfo
    friends: FriendsInfo | None = None
    private: PrivateInfo | None = None
    music: MusicPreferences | None = None


class Genres(_Base):
    genres: list[str]


# --- search --------------------------------------------------------------------


class SearchUsersQuery(_Base):
    q: str = Field(min_length=2, max_length=50, examples=["ana"])

    @field_validator("q", mode="before")
    @classmethod
    def _trim(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v


class UserSearchResult(UserSummary):
    relationship: Relationship


# --- update --------------------------------------------------------------------
# Helper validators that match class-validator's `trim` / `trimOrNull` transforms.


def _trim(v: object) -> object:
    return v.strip() if isinstance(v, str) else v


def _trim_or_null(v: object) -> object:
    if not isinstance(v, str):
        return v
    trimmed = v.strip()
    return None if trimmed == "" else trimmed


class PublicInfoUpdate(_Base):
    display_name: str | None = Field(
        default=None,
        alias="displayName",
        serialization_alias="displayName",
        min_length=1,
        max_length=PROFILE_LIMITS.display_name,
        examples=["DJ Ana"],
    )
    bio: str | None = Field(default=None, max_length=PROFILE_LIMITS.bio)
    avatar_url: str | None = Field(
        default=None,
        alias="avatarUrl",
        serialization_alias="avatarUrl",
        max_length=PROFILE_LIMITS.avatar_url,
    )

    @field_validator("display_name", mode="before")
    @classmethod
    def _display_name(cls, v: object) -> object:
        return _trim(v)

    @field_validator("bio", mode="before")
    @classmethod
    def _bio(cls, v: object) -> object:
        return _trim_or_null(v)

    @field_validator("avatar_url", mode="before")
    @classmethod
    def _avatar(cls, v: object) -> object:
        return _trim_or_null(v)

    @field_validator("avatar_url")
    @classmethod
    def _avatar_url_shape(cls, v: str | None) -> str | None:
        if v is not None and not _URL_RE.match(v):
            raise ValueError("avatarUrl must be an http(s) URL")
        return v


class FriendsInfoUpdate(_Base):
    real_name: str | None = Field(
        default=None,
        alias="realName",
        serialization_alias="realName",
        max_length=PROFILE_LIMITS.real_name,
    )
    city: str | None = Field(default=None, max_length=PROFILE_LIMITS.city)

    @field_validator("real_name", "city", mode="before")
    @classmethod
    def _clean(cls, v: object) -> object:
        return _trim_or_null(v)


class PrivateInfoUpdate(_Base):
    birth_date: str | None = Field(
        default=None, alias="birthDate", serialization_alias="birthDate", examples=["1999-04-21"]
    )
    phone: str | None = Field(default=None, examples=["+212 600 000 000"])

    @field_validator("birth_date", "phone", mode="before")
    @classmethod
    def _clean(cls, v: object) -> object:
        return _trim_or_null(v)

    @field_validator("birth_date")
    @classmethod
    def _birth_date_shape(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not _BIRTH_DATE_RE.match(v):
            raise ValueError("birthDate must be YYYY-MM-DD")
        try:
            parsed = date.fromisoformat(v)
        except ValueError as exc:
            raise ValueError("birthDate must be a real date") from exc
        today = datetime.now(UTC).date()
        if parsed < _MIN_BIRTH_DATE or parsed > today:
            raise ValueError("birthDate must be between 1900-01-01 and today")
        return v

    @field_validator("phone")
    @classmethod
    def _phone_shape(cls, v: str | None) -> str | None:
        if v is not None and not _PHONE_RE.match(v):
            raise ValueError("phone must contain 6-20 digits, spaces or + ( ) . -")
        return v


class MusicPreferencesUpdate(_Base):
    genres: list[str] | None = Field(default=None, max_length=PROFILE_LIMITS.music_items)
    tags: list[str] | None = Field(
        default=None, max_length=PROFILE_LIMITS.music_items, examples=[["90s", "road trip"]]
    )
    visibility: ProfileVisibility | None = None

    @field_validator("genres")
    @classmethod
    def _genres(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        if len(set(v)) != len(v):
            raise ValueError("genres must be unique")
        unknown = [g for g in v if g not in MUSIC_GENRES_SET]
        if unknown:
            raise ValueError(f"unknown genres: {unknown}")
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def _tags_normalize(cls, v: object) -> object:
        if not isinstance(v, list):
            return v
        return [t.strip().lower() if isinstance(t, str) else t for t in v]

    @field_validator("tags")
    @classmethod
    def _tags_validate(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        if len(set(v)) != len(v):
            raise ValueError("tags must be unique")
        for tag in v:
            if not tag or len(tag) > PROFILE_LIMITS.tag:
                raise ValueError(f"each tag must be 1-{PROFILE_LIMITS.tag} chars")
        return v


class UpdateProfile(_Base):
    public: PublicInfoUpdate | None = None
    friends: FriendsInfoUpdate | None = None
    private: PrivateInfoUpdate | None = None
    music: MusicPreferencesUpdate | None = None

    @model_validator(mode="after")
    def _any_group(self) -> UpdateProfile:
        # Not strictly required, but makes the "empty PATCH is a no-op" case explicit.
        return self
