# Docker Setup Design

**Date:** 2026-04-05
**Status:** Approved

## Goal

Containerise the inventory-manager stack so that:
- Each app (frontend, backend) can be built and deployed independently via its own `Dockerfile`
- Local development runs the full stack (postgres + backend + frontend) with a single `docker compose up`

## Files to Create

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Multi-stage image for the NestJS API |
| `frontend/Dockerfile` | Multi-stage image for the Next.js app |
| `docker-compose.yml` | Orchestrates all 3 services for local dev |
| `.env.example` | Template listing all required env vars |

## Backend Dockerfile

Two stages using `node:20-alpine`:

**Stage 1 — `builder`**
- Install all dependencies (`npm ci`)
- Run `nest build` to compile TypeScript into `dist/`

**Stage 2 — `runner`**
- Install production-only dependencies (`npm ci --omit=dev`)
- Copy `dist/` and `prisma/` from builder
- Expose port 3001
- Entrypoint: `npx prisma migrate deploy && node dist/main`

Running migrations at container start ensures the DB schema is always up to date without a separate migration step.

## Frontend Dockerfile

Two stages using `node:20-alpine`:

**Stage 1 — `builder`**
- Install all dependencies (`npm ci`)
- Copy source, run `next build`
- Requires `output: 'standalone'` in `next.config.ts` to produce a self-contained `server.js`

**Stage 2 — `runner`**
- Copy `.next/standalone/`, `.next/static/`, and `public/` from builder
- Expose port 3000
- Entrypoint: `node server.js`

`next.config.ts` change: add `output: 'standalone'` to the Next.js config.

## docker-compose.yml

Located at `inventory-manager/` (project root). Three services:

**`postgres`**
- Image: `postgres:16-alpine`
- Named volume for data persistence
- Healthcheck: `pg_isready`
- Env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

**`backend`**
- Build context: `./backend`
- Port: `3001:3001`
- `depends_on: postgres` with `condition: service_healthy`
- Env vars: `DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- `DATABASE_URL` constructed from postgres service credentials

**`frontend`**
- Build context: `./frontend`
- Port: `3000:3000`
- `depends_on: backend`
- Env vars: `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`

## .env.example

Documents all required variables with placeholder values:

```
# Postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory

# Backend
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://inventory-api

# Frontend
AUTH0_SECRET=a-long-random-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Local Dev Workflow

```bash
cp .env.example .env   # fill in Auth0 values
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Postgres: localhost:5432

## Deployment (Independent)

Each app is independently deployable:

```bash
# Backend only
docker build -t inventory-backend ./backend

# Frontend only
docker build -t inventory-frontend ./frontend
```

Both images are self-contained and accept env vars at runtime.

## Out of Scope

- Production docker-compose override files
- CI/CD pipeline integration
- Database seeding
