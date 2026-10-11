"""Users service — port of backend/src/modules/users/users.service.ts.

The ONE place where profile visibility is enforced: `getUserProfile()` runs each
request through `visible_sections()` to decide which groups to include. Any new
feature that reads another user's profile MUST go through this service, not raw ORM.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import AppError
from app.db.enums import ProfileVisibility
from app.db.models.profile import Profile
from app.db.models.user import User
from app.modules.friends.service import FriendsService
from app.modules.users.constants import MUSIC_GENRES
from app.modules.users.schemas import (
    FriendsInfo,
    Genres,
    MusicPreferences,
    MyProfile,
    PrivateInfo,
    PublicInfo,
    UpdateProfile,
    UserProfile,
    UserSearchResult,
)
from app.modules.users.visibility import visible_sections


class UsersService:
    def __init__(self, session: AsyncSession, friends: FriendsService) -> None:
        self._session = session
        self._friends = friends

    async def genres(self) -> Genres:
        return Genres(genres=list(MUSIC_GENRES))

    async def search(self, viewer_id: str, query: str) -> list[UserSearchResult]:
        rows = (
            (
                await self._session.execute(
                    select(User)
                    .where(
                        User.id != viewer_id,
                        User.email_verified_at.is_not(None),
                        func.lower(User.display_name).contains(query.lower()),
                    )
                    .options(selectinload(User.profile))
                    .order_by(User.display_name)
                    .limit(20)
                )
            )
            .scalars()
            .all()
        )

        relationships = await self._friends.relationships(viewer_id, [u.id for u in rows])
        results = [
            UserSearchResult(
                id=u.id,
                display_name=u.display_name,
                avatar_url=u.profile.avatar_url if u.profile else None,
                relationship=relationships.get(u.id, "NONE"),
            )
            for u in rows
        ]
        # Case-insensitive sort to match the Nest `localeCompare({sensitivity:'base'})`.
        results.sort(key=lambda r: r.display_name.casefold())
        return results

    async def get_user_profile(self, viewer_id: str, user_id: str) -> UserProfile:
        is_self = viewer_id == user_id
        q = select(User).where(User.id == user_id).options(selectinload(User.profile))
        if not is_self:
            q = q.where(User.email_verified_at.is_not(None))
        user = await self._session.scalar(q)
        if user is None:
            raise AppError(404, "USER_NOT_FOUND", "User not found.")

        relationship = await self._friends.relationship(viewer_id, user_id)
        profile = user.profile
        music_vis = profile.music_visibility if profile else ProfileVisibility.PUBLIC
        visible = visible_sections(relationship, music_vis)

        # Only set the field when visible so `response_model_exclude_unset=True` can
        # drop the key entirely. Setting it to None would leave the nested nulls stripped
        # by `exclude_none=True`, which would in turn hide legitimate inner nulls like
        # `friends.realName = null` on a friend whose profile is empty.
        kwargs: dict[str, object] = {
            "id": user.id,
            "relationship": relationship,
            "public": _public_info(user.display_name, profile),
        }
        if visible.friends:
            kwargs["friends"] = _friends_info(profile)
        if visible.private:
            kwargs["private"] = _private_info(profile)
        if visible.music:
            kwargs["music"] = _music_prefs(profile)
        return UserProfile(**kwargs)

    async def get_my_profile(self, user_id: str) -> MyProfile:
        user = await self._session.scalar(
            select(User).where(User.id == user_id).options(selectinload(User.profile))
        )
        if user is None:
            raise AppError(404, "USER_NOT_FOUND", "User not found.")
        return _to_my_profile(user)

    async def update_my_profile(self, user_id: str, dto: UpdateProfile) -> MyProfile:
        user = await self._session.scalar(
            select(User).where(User.id == user_id).options(selectinload(User.profile))
        )
        if user is None:
            raise AppError(404, "USER_NOT_FOUND", "User not found.")

        # Mutable patch set — only groups explicitly present become changes.
        # displayName is on User, every other field is on Profile.
        if (
            dto.public is not None
            and _was_set(dto.public, "display_name")
            and dto.public.display_name is not None
        ):
            user.display_name = dto.public.display_name
        profile = user.profile
        if profile is None:
            profile = Profile(user_id=user.id)
            user.profile = profile
            self._session.add(profile)

        _apply_group(dto.public, profile, {"bio": "bio", "avatar_url": "avatar_url"})
        _apply_group(dto.friends, profile, {"real_name": "real_name", "city": "city"})
        if dto.private is not None:
            if _was_set(dto.private, "birth_date"):
                profile.birth_date = _parse_birth_date(dto.private.birth_date)
            if _was_set(dto.private, "phone"):
                profile.phone = dto.private.phone
        if dto.music is not None:
            if _was_set(dto.music, "genres") and dto.music.genres is not None:
                profile.music_genres = list(dto.music.genres)
            if _was_set(dto.music, "tags") and dto.music.tags is not None:
                profile.music_tags = list(dto.music.tags)
            if _was_set(dto.music, "visibility") and dto.music.visibility is not None:
                profile.music_visibility = dto.music.visibility

        await self._session.commit()
        await self._session.refresh(user, attribute_names=["profile"])
        return _to_my_profile(user)


# --- shared mapping helpers ---------------------------------------------------


def _public_info(display_name: str, profile: Profile | None) -> PublicInfo:
    return PublicInfo(
        display_name=display_name,
        bio=profile.bio if profile else None,
        avatar_url=profile.avatar_url if profile else None,
    )


def _friends_info(profile: Profile | None) -> FriendsInfo:
    return FriendsInfo(
        real_name=profile.real_name if profile else None,
        city=profile.city if profile else None,
    )


def _private_info(profile: Profile | None) -> PrivateInfo:
    birth = profile.birth_date if profile else None
    return PrivateInfo(
        birth_date=birth.isoformat() if isinstance(birth, date) else None,
        phone=profile.phone if profile else None,
    )


def _music_prefs(profile: Profile | None) -> MusicPreferences:
    if profile is None:
        return MusicPreferences(genres=[], tags=[], visibility=ProfileVisibility.PUBLIC)
    return MusicPreferences(
        genres=list(profile.music_genres),
        tags=list(profile.music_tags),
        visibility=profile.music_visibility,
    )


def _to_my_profile(user: User) -> MyProfile:
    profile = user.profile
    return MyProfile(
        id=user.id,
        email=user.email,
        public=_public_info(user.display_name, profile),
        friends=_friends_info(profile),
        private=_private_info(profile),
        music=_music_prefs(profile),
    )


def _was_set(dto: Any, name: str) -> bool:
    """True if the field name appeared in the original PATCH body.

    Pydantic exposes `model_fields_set` for exactly this; it lets us distinguish
    "field not sent" (leave alone) from "field sent as None" (clear).
    """
    return name in dto.model_fields_set


def _apply_group(dto: Any, profile: Profile, field_map: dict[str, str]) -> None:
    if dto is None:
        return
    for dto_field, model_attr in field_map.items():
        if _was_set(dto, dto_field):
            setattr(profile, model_attr, getattr(dto, dto_field))


def _parse_birth_date(value: str | None) -> date | None:
    if value is None:
        return None
    return date.fromisoformat(value)
