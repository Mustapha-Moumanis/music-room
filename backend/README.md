# musicroom-backend

FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2 service for Music Room.

## Local run

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
```

Swagger UI is at `http://localhost:3000/api/docs`.

## Layout

Everything under `app/modules/*` is a self-contained HTTP module (router, service,
schemas). Shared infrastructure (DB, logging, security, exception envelope) lives
under `app/core/`; cross-cutting middleware under `app/middleware/`.
