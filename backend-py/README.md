# musicroom-backend (FastAPI)

Python port of the NestJS backend. Built in parallel; cutover happens in a single commit once contract parity with `backend/` is proven (see `.claude/plans/lets-discover-the-stuff-effervescent-wigderson.md`).

## Local run

```bash
cd backend-py
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

Mobile `.env.local` can point at `http://localhost:3001/api` to exercise this service while NestJS continues to serve `:3000`.

## Layout

See the migration plan. Everything under `app/modules/*` mirrors a NestJS module one-for-one.
