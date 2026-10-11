"""Idempotent demo-user seed.

Port of backend/prisma/seed.ts: upserts `demo1@musicroom.local` and
`demo2@musicroom.local` (both pre-verified, password `Password123!`, same profile
seed). Running twice is safe.

Invoke via `make seed` (runs inside the backend container) or directly:
    uv run python -m app.scripts.seed
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.base import dispose_engine, get_sessionmaker, init_engine, normalise_database_url
from app.db.enums import IdentityProvider
from app.db.models.identity import Identity
from app.db.models.profile import Profile
from app.db.models.user import User
from app.settings import get_settings


async def upsert_demo_user(
    session: AsyncSession, email: str, display_name: str, password: str
) -> str:
    now = datetime.now(UTC).replace(tzinfo=None)
    password_hash = hash_password(password)

    user = await session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            email=email,
            display_name=display_name,
            password_hash=password_hash,
            email_verified_at=now,
        )
        session.add(user)
        await session.flush()
    else:
        user.display_name = display_name
        user.password_hash = password_hash
        user.email_verified_at = now

    identity = await session.scalar(
        select(Identity).where(
            Identity.provider == IdentityProvider.LOCAL,
            Identity.provider_id == email,
        )
    )
    if identity is None:
        session.add(Identity(provider=IdentityProvider.LOCAL, provider_id=email, user_id=user.id))
    elif identity.user_id != user.id:
        identity.user_id = user.id

    profile = await session.scalar(select(Profile).where(Profile.user_id == user.id))
    if profile is None:
        session.add(
            Profile(
                user_id=user.id,
                bio=f"{display_name} is a demo listener.",
                music_genres=["house", "pop"],
            )
        )

    return user.id


async def _main() -> None:
    settings = get_settings()
    init_engine(normalise_database_url(settings.DATABASE_URL))
    try:
        sm = get_sessionmaker()
        async with sm() as session:
            ids = [
                await upsert_demo_user(
                    session, "demo1@musicroom.local", "Demo One", "Password123!"
                ),
                await upsert_demo_user(
                    session, "demo2@musicroom.local", "Demo Two", "Password123!"
                ),
            ]
            await session.commit()
        print(f"Seeded demo users: {', '.join(ids)}")
    finally:
        await dispose_engine()


if __name__ == "__main__":
    asyncio.run(_main())
