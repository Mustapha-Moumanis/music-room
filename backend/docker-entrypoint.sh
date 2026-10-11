#!/usr/bin/env bash
# Entry point for the FastAPI container.
#
# Cutover-aware migration logic:
#   - If the DB already carries the application schema (User table exists) and we
#     haven't started tracking it with alembic yet, STAMP the baseline so we don't try
#     to CREATE TYPE / CREATE TABLE for things that already exist.
#   - Otherwise, run `alembic upgrade head` normally.
#
# Attaching to a database with an existing schema is a no-op; data is preserved.

set -euo pipefail

python_cmd() {
    uv run python - "$@"
}

needs_stamp() {
    python_cmd <<'PY'
import asyncio
import os
import sys
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import asyncpg

url = os.environ.get("DATABASE_URL", "")
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)
# asyncpg handles postgresql://... — strip params it does not accept.
parts = urlsplit(url)
if parts.query:
    kept = [(k, v) for k, v in parse_qsl(parts.query)
            if k not in {"schema", "pgbouncer", "pool_timeout", "connection_limit"}]
    url = urlunsplit(parts._replace(query=urlencode(kept)))

async def main() -> int:
    conn = await asyncpg.connect(url)
    try:
        has_alembic = await conn.fetchval(
            "SELECT to_regclass('public.alembic_version') IS NOT NULL"
        )
        has_user = await conn.fetchval("SELECT to_regclass('public.\"User\"') IS NOT NULL")
    finally:
        await conn.close()
    # 0 = stamp (schema exists but alembic hasn't been initialised)
    # 1 = upgrade (either fresh DB, or alembic already in control)
    return 0 if (has_user and not has_alembic) else 1

sys.exit(asyncio.run(main()))
PY
}

echo "[entrypoint] inspecting database state"
if needs_stamp; then
    echo "[entrypoint] existing application schema detected — stamping alembic baseline"
    uv run alembic stamp 0001_baseline
else
    echo "[entrypoint] running alembic upgrade head"
    uv run alembic upgrade head
fi

echo "[entrypoint] starting server: $*"
exec "$@"
