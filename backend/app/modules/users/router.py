"""Users endpoints.

The order matters: `/users/:id` must be declared after `/users/me`, `/users/genres`
and `/users/search` so the fixed names don't get captured as path params.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.deps import CurrentUserDep, SessionDep
from app.modules.friends.service import FriendsService
from app.modules.users.schemas import (
    Genres,
    MyProfile,
    SearchUsersQuery,
    UpdateProfile,
    UserProfile,
    UserSearchResult,
)
from app.modules.users.service import UsersService

router = APIRouter(prefix="/users", tags=["users"])


def _service(session: SessionDep) -> UsersService:
    return UsersService(session, FriendsService(session))


ServiceDep = Annotated[UsersService, Depends(_service)]


@router.get(
    "/me",
    response_model=MyProfile,
    summary="Get my full profile (public, friends-only, private and music preferences)",
)
async def get_me(user: CurrentUserDep, service: ServiceDep) -> MyProfile:
    return await service.get_my_profile(user.id)


@router.patch(
    "/me",
    response_model=MyProfile,
    summary="Update my profile; only the fields sent change and null clears a field",
)
async def update_me(dto: UpdateProfile, user: CurrentUserDep, service: ServiceDep) -> MyProfile:
    return await service.update_my_profile(user.id, dto)


@router.get(
    "/genres",
    response_model=Genres,
    summary="List the genres accepted in music preferences",
)
async def genres(service: ServiceDep) -> Genres:
    return await service.genres()


@router.get(
    "/search",
    response_model=list[UserSearchResult],
    summary="Find people by display name (max 20, yourself excluded)",
)
async def search(
    user: CurrentUserDep,
    service: ServiceDep,
    q: Annotated[str, Query(min_length=2, max_length=50, examples=["ana"])],
) -> list[UserSearchResult]:
    query = SearchUsersQuery(q=q)
    return await service.search(user.id, query.q)


# Declared last so the fixed names above aren't captured as path params.
# `exclude_unset=True` omits non-visible sections at the top level (the service doesn.t
# set them when they're hidden) while leaving legitimate nested nulls intact —
# dropping un-set keys rather than emitting them as null.
@router.get(
    "/{id}",
    response_model=UserProfile,
    response_model_exclude_unset=True,
    summary="View a user's profile: public always, friends-only for friends, private only for yourself",
)
async def get_user(id: str, user: CurrentUserDep, service: ServiceDep) -> UserProfile:
    return await service.get_user_profile(user.id, id)
