"""Friends service — port of backend/src/modules/friends/friends.service.ts.

Pair locking uses `pg_advisory_xact_lock(hashtextextended(key, 0))` just like the Nest
version, so two users requesting each other at the same instant end up with one
ACCEPTED friendship rather than two mirrored PENDING rows.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import TypeVar

from sqlalchemy import and_, delete, exists, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.db.enums import FriendshipStatus
from app.db.models.friendship import Friendship
from app.db.models.user import User
from app.modules.friends.schemas import (
    Friend,
    FriendRequest,
    FriendRequests,
    Relationship,
    RelationshipResponse,
    UserSummary,
)

T = TypeVar("T")


def _pair_key(a: str, b: str) -> str:
    return f"friendship:{':'.join(sorted((a, b)))}"


def _summary_from_user(user: User) -> UserSummary:
    return UserSummary(
        id=user.id,
        display_name=user.display_name,
        avatar_url=user.profile.avatar_url if user.profile else None,
    )


class FriendsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # --- listings ---------------------------------------------------------------

    async def list(self, user_id: str) -> list[Friend]:
        from sqlalchemy.orm import selectinload

        rows = (
            (
                await self._session.execute(
                    select(Friendship)
                    .where(
                        Friendship.status == FriendshipStatus.ACCEPTED,
                        or_(
                            Friendship.requester_id == user_id,
                            Friendship.addressee_id == user_id,
                        ),
                    )
                    .options(
                        selectinload(Friendship.requester).selectinload(User.profile),
                        selectinload(Friendship.addressee).selectinload(User.profile),
                    )
                )
            )
            .scalars()
            .all()
        )
        friends: list[Friend] = []
        for row in rows:
            other = row.addressee if row.requester_id == user_id else row.requester
            friends.append(
                Friend(
                    id=other.id,
                    display_name=other.display_name,
                    avatar_url=other.profile.avatar_url if other.profile else None,
                    since=row.updated_at,
                )
            )
        friends.sort(key=lambda f: f.display_name.casefold())
        return friends

    async def requests(self, user_id: str) -> FriendRequests:
        from sqlalchemy.orm import selectinload

        incoming_rows = (
            (
                await self._session.execute(
                    select(Friendship)
                    .where(
                        Friendship.addressee_id == user_id,
                        Friendship.status == FriendshipStatus.PENDING,
                    )
                    .options(selectinload(Friendship.requester).selectinload(User.profile))
                    .order_by(Friendship.created_at.desc())
                )
            )
            .scalars()
            .all()
        )
        outgoing_rows = (
            (
                await self._session.execute(
                    select(Friendship)
                    .where(
                        Friendship.requester_id == user_id,
                        Friendship.status == FriendshipStatus.PENDING,
                    )
                    .options(selectinload(Friendship.addressee).selectinload(User.profile))
                    .order_by(Friendship.created_at.desc())
                )
            )
            .scalars()
            .all()
        )
        return FriendRequests(
            incoming=[
                FriendRequest(user=_summary_from_user(r.requester), created_at=r.created_at)
                for r in incoming_rows
            ],
            outgoing=[
                FriendRequest(user=_summary_from_user(r.addressee), created_at=r.created_at)
                for r in outgoing_rows
            ],
        )

    # --- mutations --------------------------------------------------------------

    async def send_request(self, user_id: str, target_id: str) -> RelationshipResponse:
        if user_id == target_id:
            raise AppError(
                400, "CANNOT_FRIEND_SELF", "You cannot send a friend request to yourself."
            )
        await self._assert_active_user(target_id)

        async def work() -> Relationship:
            existing = await self._session.scalar(
                select(Friendship).where(
                    or_(
                        and_(
                            Friendship.requester_id == user_id,
                            Friendship.addressee_id == target_id,
                        ),
                        and_(
                            Friendship.requester_id == target_id,
                            Friendship.addressee_id == user_id,
                        ),
                    )
                )
            )
            if existing is None:
                self._session.add(Friendship(requester_id=user_id, addressee_id=target_id))
                return "REQUEST_SENT"
            if existing.status == FriendshipStatus.ACCEPTED:
                return "FRIENDS"
            if existing.requester_id == user_id:
                return "REQUEST_SENT"
            existing.status = FriendshipStatus.ACCEPTED
            existing.updated_at = datetime.utcnow()
            return "FRIENDS"

        relationship = await self._with_pair_lock(user_id, target_id, work)
        return RelationshipResponse(user_id=target_id, relationship=relationship)

    async def accept(self, user_id: str, requester_id: str) -> RelationshipResponse:
        async def work() -> None:
            existing = await self._session.scalar(
                select(Friendship).where(
                    or_(
                        and_(
                            Friendship.requester_id == user_id,
                            Friendship.addressee_id == requester_id,
                        ),
                        and_(
                            Friendship.requester_id == requester_id,
                            Friendship.addressee_id == user_id,
                        ),
                    )
                )
            )
            if existing and existing.status == FriendshipStatus.ACCEPTED:
                return
            if existing is None or existing.requester_id != requester_id:
                raise AppError(
                    404,
                    "FRIEND_REQUEST_NOT_FOUND",
                    "No pending friend request from this user.",
                )
            existing.status = FriendshipStatus.ACCEPTED
            existing.updated_at = datetime.utcnow()

        await self._with_pair_lock(user_id, requester_id, work)
        return RelationshipResponse(user_id=requester_id, relationship="FRIENDS")

    async def decline(self, user_id: str, requester_id: str) -> None:
        async def work() -> None:
            await self._session.execute(
                delete(Friendship).where(
                    Friendship.requester_id == requester_id,
                    Friendship.addressee_id == user_id,
                    Friendship.status == FriendshipStatus.PENDING,
                )
            )

        await self._with_pair_lock(user_id, requester_id, work)

    async def cancel(self, user_id: str, addressee_id: str) -> None:
        async def work() -> None:
            await self._session.execute(
                delete(Friendship).where(
                    Friendship.requester_id == user_id,
                    Friendship.addressee_id == addressee_id,
                    Friendship.status == FriendshipStatus.PENDING,
                )
            )

        await self._with_pair_lock(user_id, addressee_id, work)

    async def remove(self, user_id: str, friend_id: str) -> None:
        async def work() -> None:
            await self._session.execute(
                delete(Friendship).where(
                    Friendship.status == FriendshipStatus.ACCEPTED,
                    or_(
                        and_(
                            Friendship.requester_id == user_id,
                            Friendship.addressee_id == friend_id,
                        ),
                        and_(
                            Friendship.requester_id == friend_id,
                            Friendship.addressee_id == user_id,
                        ),
                    ),
                )
            )

        await self._with_pair_lock(user_id, friend_id, work)

    # --- relationship queries ---------------------------------------------------

    async def relationship(self, viewer_id: str, target_id: str) -> Relationship:
        mapping = await self.relationships(viewer_id, [target_id])
        return mapping.get(target_id, "NONE")

    async def relationships(self, viewer_id: str, target_ids: list[str]) -> dict[str, Relationship]:
        result: dict[str, Relationship] = {
            tid: ("SELF" if tid == viewer_id else "NONE") for tid in target_ids
        }
        others = [tid for tid in target_ids if tid != viewer_id]
        if not others:
            return result
        rows = (
            (
                await self._session.execute(
                    select(Friendship).where(
                        or_(
                            and_(
                                Friendship.requester_id == viewer_id,
                                Friendship.addressee_id.in_(others),
                            ),
                            and_(
                                Friendship.addressee_id == viewer_id,
                                Friendship.requester_id.in_(others),
                            ),
                        )
                    )
                )
            )
            .scalars()
            .all()
        )
        for row in rows:
            sent = row.requester_id == viewer_id
            other_id = row.addressee_id if sent else row.requester_id
            if row.status == FriendshipStatus.ACCEPTED:
                result[other_id] = "FRIENDS"
            else:
                result[other_id] = "REQUEST_SENT" if sent else "REQUEST_RECEIVED"
        return result

    # --- helpers ----------------------------------------------------------------

    async def _assert_active_user(self, user_id: str) -> None:
        exists_q = await self._session.scalar(
            select(
                exists().where(
                    User.id == user_id,
                    User.email_verified_at.is_not(None),
                )
            )
        )
        if not exists_q:
            raise AppError(404, "USER_NOT_FOUND", "User not found.")

    async def _with_pair_lock(self, a: str, b: str, work: Callable[[], Awaitable[T]]) -> T:
        """Advisory-lock the (a, b) pair for the duration of this transaction.

        The async session is already in an implicit transaction by the time we get
        here (SQLAlchemy autobegin fires on the first query from `_assert_active_user`),
        so we don't open a new one — just drop in the advisory lock, do the work,
        and commit together. The lock is scoped to the current xact and released on
        commit/rollback automatically.
        """
        key = _pair_key(a, b)
        await self._session.execute(
            text("SELECT pg_advisory_xact_lock(hashtextextended(:k, 0))").bindparams(k=key)
        )
        try:
            result = await work()
            await self._session.commit()
            return result
        except Exception:
            await self._session.rollback()
            raise
