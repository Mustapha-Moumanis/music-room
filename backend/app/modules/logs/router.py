"""POST /api/logs/client — public endpoint for mobile-side audit events.

No auth required; user id is picked up if the client happens to send a Bearer token,
otherwise the row is anonymous.
"""

from __future__ import annotations

from fastapi import APIRouter, Request, status

from app.core.action_log import ActionLogEntry, record_many
from app.db.enums import ActionLogKind
from app.deps import OptionalUserDep
from app.middleware.client_info import extract_client_info
from app.modules.logs.schemas import ClientEvents, ClientEventsAccepted

router = APIRouter(prefix="/logs", tags=["logs"])


@router.post(
    "/client",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ClientEventsAccepted,
    summary="Accept client-side action logs",
)
async def record_client_events(
    dto: ClientEvents,
    request: Request,
    user: OptionalUserDep,
) -> ClientEventsAccepted:
    headers = {k.decode().lower(): v.decode() for k, v in request.scope.get("headers", [])}
    info = extract_client_info(headers)
    ip = request.client.host if request.client else None
    entries = [
        ActionLogEntry(
            kind=ActionLogKind.CLIENT,
            action=event.action,
            platform=info.platform,
            device=info.device,
            app_version=info.app_version,
            request_id=info.request_id or None,
            ip=ip,
            user_id=user.id if user else None,
            meta=event.meta,
            created_at=event.at.replace(tzinfo=None) if event.at else None,
        )
        for event in dto.events
    ]
    await record_many(entries)
    return ClientEventsAccepted(accepted=len(dto.events))
