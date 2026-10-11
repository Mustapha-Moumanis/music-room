"""Importing this module registers every ORM class with the declarative Base.

Alembic's `env.py` imports `app.db.models` so autogenerate sees every table.
"""

from app.db.models.action_log import ActionLog
from app.db.models.email_token import EmailToken
from app.db.models.event import Event
from app.db.models.event_invite import EventInvite
from app.db.models.event_track import EventTrack
from app.db.models.friendship import Friendship
from app.db.models.identity import Identity
from app.db.models.playlist import Playlist
from app.db.models.playlist_member import PlaylistMember
from app.db.models.playlist_track import PlaylistTrack
from app.db.models.profile import Profile
from app.db.models.refresh_token import RefreshToken
from app.db.models.track import Track
from app.db.models.user import User
from app.db.models.vote import Vote

__all__ = [
    "ActionLog",
    "EmailToken",
    "Event",
    "EventInvite",
    "EventTrack",
    "Friendship",
    "Identity",
    "Playlist",
    "PlaylistMember",
    "PlaylistTrack",
    "Profile",
    "RefreshToken",
    "Track",
    "User",
    "Vote",
]
