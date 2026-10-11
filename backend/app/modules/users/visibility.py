"""Single source of truth for profile-group visibility.

Any divergence here would silently change which profile sections leak to strangers,
so every branch is covered by unit tests.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.db.enums import ProfileVisibility
from app.modules.friends.schemas import Relationship


@dataclass(frozen=True)
class VisibleSections:
    friends: bool
    private: bool
    music: bool


def visible_sections(
    relationship: Relationship, music_visibility: ProfileVisibility
) -> VisibleSections:
    """Public info is always visible. A pending request grants nothing."""
    is_self = relationship == "SELF"
    is_friend = relationship == "FRIENDS"
    return VisibleSections(
        friends=is_self or is_friend,
        private=is_self,
        music=(
            is_self
            or music_visibility == ProfileVisibility.PUBLIC
            or (music_visibility == ProfileVisibility.FRIENDS and is_friend)
        ),
    )
