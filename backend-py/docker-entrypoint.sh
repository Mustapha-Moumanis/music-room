#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] running database migrations"
uv run alembic upgrade head

echo "[entrypoint] starting server: $*"
exec "$@"
