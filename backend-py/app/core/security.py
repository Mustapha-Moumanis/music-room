"""Password hashing + token hashing + constant-time compare.

Argon2 parameters are byte-identical with backend/src/modules/auth/auth.service.ts:27
(`t=2, m=19456, p=1, type=id`). Any drift would invalidate every existing seeded hash,
so the test suite pins these values.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import re
import secrets
from datetime import timedelta

from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerifyMismatchError

# These three numbers are a security contract: changing any one of them means every
# existing password hash in the DB stops verifying. Only touch after a planned re-hash.
ARGON2_TIME_COST = 2
ARGON2_MEMORY_COST = 19456  # 19 MiB
ARGON2_PARALLELISM = 1

_PASSWORD_HASHER = PasswordHasher(
    time_cost=ARGON2_TIME_COST,
    memory_cost=ARGON2_MEMORY_COST,
    parallelism=ARGON2_PARALLELISM,
    type=Type.ID,
)

# Dummy hash used by auth.service.login() so an unknown email takes the same amount of
# time to reject as a known one. The exact string matches auth.service.ts:26 so the two
# backends have identical login timing.
DUMMY_PASSWORD_HASH = (
    "$argon2id$v=19$m=19456,t=2,p=1$zknhCbd0m/DS7TyVKU5sng$"
    "UpoADxamCbKD0F2tSDj0X7NQ73jCl/E+iIA3tzhDgY0"
)


def hash_password(password: str) -> str:
    return _PASSWORD_HASHER.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _PASSWORD_HASHER.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False
    except Exception:
        return False


def sha256_base64url(value: str) -> str:
    """Match Node's `createHash('sha256').update(value).digest('base64url')`."""
    digest = hashlib.sha256(value.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def hmac_sha256_base64url(secret: str, value: str) -> str:
    """Match Node's `createHmac('sha256', secret).update(value).digest('base64url')`."""
    digest = hmac.new(secret.encode("utf-8"), value.encode("utf-8"), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def safe_equal(a: str, b: str) -> bool:
    """Constant-time string comparison. Different lengths return False safely."""
    return len(a) == len(b) and hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))


def random_token_urlsafe(nbytes: int = 32) -> str:
    """URL-safe random token. 32 bytes = ~43 base64url chars with ~256 bits of entropy."""
    return secrets.token_urlsafe(nbytes)


def random_numeric_code(digits: int = 6) -> str:
    """Zero-padded numeric code (0..10**digits - 1), e.g. '042137'.

    Matches `randomInt(0, 1_000_000).toString().padStart(6, '0')` in auth.service.ts.
    """
    upper = 10**digits
    return str(secrets.randbelow(upper)).zfill(digits)


_TTL_RE = re.compile(r"^([1-9]\d*)(ms|s|m|h|d|w|y)$")
_UNIT_SECONDS: dict[str, float] = {
    "ms": 0.001,
    "s": 1,
    "m": 60,
    "h": 60 * 60,
    "d": 24 * 60 * 60,
    "w": 7 * 24 * 60 * 60,
    "y": 365 * 24 * 60 * 60,
}


def parse_ttl(value: str) -> timedelta:
    """Parse the `[0-9]+(ms|s|m|h|d|w|y)` TTL format used by every TTL env var.

    Mirrors backend/src/core/auth/ttl.ts.
    """
    match = _TTL_RE.match(value)
    if not match:
        raise ValueError(f"invalid TTL: {value!r}")
    amount, unit = match.groups()
    return timedelta(seconds=int(amount) * _UNIT_SECONDS[unit])
