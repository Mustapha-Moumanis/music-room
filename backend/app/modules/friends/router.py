"""Friends endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Response, status

from app.deps import CurrentUserDep, SessionDep
from app.modules.friends.schemas import Friend, FriendRequests, RelationshipResponse
from app.modules.friends.service import FriendsService

router = APIRouter(prefix="/friends", tags=["friends"])


def _service(session: SessionDep) -> FriendsService:
    return FriendsService(session)


@router.get("", response_model=list[Friend], summary="List my friends")
async def list_friends(user: CurrentUserDep, session: SessionDep) -> list[Friend]:
    return await _service(session).list(user.id)


@router.get(
    "/requests",
    response_model=FriendRequests,
    summary="List pending friend requests I received and sent",
)
async def list_requests(user: CurrentUserDep, session: SessionDep) -> FriendRequests:
    return await _service(session).requests(user.id)


@router.post(
    "/requests/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=RelationshipResponse,
    summary="Send a friend request (idempotent; accepts theirs if they already asked)",
)
async def send_request(
    user_id: str, user: CurrentUserDep, session: SessionDep
) -> RelationshipResponse:
    return await _service(session).send_request(user.id, user_id)


@router.post(
    "/requests/{user_id}/accept",
    status_code=status.HTTP_200_OK,
    response_model=RelationshipResponse,
    summary="Accept the friend request this user sent me",
)
async def accept(user_id: str, user: CurrentUserDep, session: SessionDep) -> RelationshipResponse:
    return await _service(session).accept(user.id, user_id)


@router.post(
    "/requests/{user_id}/decline",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Decline the friend request this user sent me",
)
async def decline(user_id: str, user: CurrentUserDep, session: SessionDep) -> Response:
    await _service(session).decline(user.id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/requests/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel the friend request I sent to this user",
)
async def cancel(user_id: str, user: CurrentUserDep, session: SessionDep) -> Response:
    await _service(session).cancel(user.id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a friend",
)
async def remove(user_id: str, user: CurrentUserDep, session: SessionDep) -> Response:
    await _service(session).remove(user.id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
