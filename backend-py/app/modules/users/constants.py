"""Port of backend/src/modules/users/profile.constants.ts."""

from __future__ import annotations

# Fixed genre list exposed by GET /api/users/genres and accepted by UpdateProfile.music.
# Keep the ORDER identical to the Nest list so the mobile picker UI preserves affordances.
MUSIC_GENRES: tuple[str, ...] = (
    "afrobeat",
    "ambient",
    "blues",
    "chaabi",
    "classical",
    "country",
    "dance",
    "disco",
    "drum-and-bass",
    "dubstep",
    "electronic",
    "folk",
    "funk",
    "gnawa",
    "gospel",
    "hip-hop",
    "house",
    "indie",
    "jazz",
    "k-pop",
    "latin",
    "lo-fi",
    "metal",
    "pop",
    "punk",
    "r-and-b",
    "rai",
    "rap",
    "reggae",
    "reggaeton",
    "rock",
    "soul",
    "soundtrack",
    "techno",
    "trap",
    "world",
)
MUSIC_GENRES_SET: frozenset[str] = frozenset(MUSIC_GENRES)


class PROFILE_LIMITS:  # noqa: N801 — mirrors the TS object shape
    display_name = 80
    bio = 280
    avatar_url = 2048
    real_name = 80
    city = 80
    phone = 20
    music_items = 10
    tag = 30
