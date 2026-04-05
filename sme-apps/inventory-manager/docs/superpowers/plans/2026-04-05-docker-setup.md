# Docker Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Containerise the NestJS backend, Next.js frontend, and PostgreSQL database so each app is independently deployable via its own Dockerfile and the full stack runs locally with `docker compose up`.

**Architecture:** Each app has a two-stage Dockerfile (builder + lean runtime). A `docker-compose.yml` at the `inventory-manager/` root wires all three services together with health checks and env var injection. `next.config.ts` is updated to enable standalone output, which is required for the frontend's slim runtime image.

**Tech Stack:** Docker, Docker Compose v2, Node 20 Alpine, PostgreSQL 16 Alpine, NestJS (`nest build` / `node dist/main`), Next.js 16 standalone output

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/.dockerignore` | Exclude node_modules, dist, .env from build context |
| Create | `backend/Dockerfile` | Two-stage image: compile TS → lean runtime + migrate-on-start |
| Create | `frontend/.dockerignore` | Exclude node_modules, .next from build context |
| Create | `frontend/Dockerfile` | Two-stage image: next build → standalone runtime |
| Modify | `frontend/next.config.ts` | Add `output: 'standalone'` |
| Create | `docker-compose.yml` | Orchestrate postgres + backend + frontend for local dev |
| Create | `.env.example` | Document all required env vars with placeholder values |

---

### Task 1: Backend `.dockerignore`

**Files:**
- Create: `backend/.dockerignore`

- [ ] **Step 1: Create the file**

```
node_modules
dist
.env
.env.*
coverage
```

- [ ] **Step 2: Verify the file exists**

```bash
cat backend/.dockerignore
```
Expected: the five lines above printed to stdout.

- [ ] **Step 3: Commit**

```bash
git add backend/.dockerignore
git commit -m "chore(backend): add .dockerignore"
```

---

### Task 2: Backend `Dockerfile`

**Files:**
- Create: `backend/Dockerfile`

The entrypoint runs `prisma migrate deploy` before starting the server so the DB schema is always current without a manual migration step.

- [ ] **Step 1: Create the Dockerfile**

```dockerfile
# ── Stage 1: build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: runtime ────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

- [ ] **Step 2: Verify the build locally (no compose yet)**

Run from `inventory-manager/`:
```bash
docker build -t inventory-backend ./backend
```
Expected: build completes, both stages succeed, final image tagged `inventory-backend`.

- [ ] **Step 3: Commit**

```bash
git add backend/Dockerfile
git commit -m "chore(backend): add multi-stage Dockerfile"
```

---

### Task 3: Frontend `next.config.ts` — enable standalone output

**Files:**
- Modify: `frontend/next.config.ts`

Next.js standalone output copies only the files needed to run the app into `.next/standalone/`, which allows a minimal Docker image without bundling `node_modules` in full.

- [ ] **Step 1: Update the config**

Replace the contents of `frontend/next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 2: Verify the build still works**

```bash
cd frontend && npm run build
```
Expected: build succeeds, `.next/standalone/` directory created.

- [ ] **Step 3: Commit**

```bash
git add frontend/next.config.ts
git commit -m "chore(frontend): enable standalone output for Docker"
```

---

### Task 4: Frontend `.dockerignore`

**Files:**
- Create: `frontend/.dockerignore`

- [ ] **Step 1: Create the file**

```
node_modules
.next
.env
.env.*
```

- [ ] **Step 2: Verify the file exists**

```bash
cat frontend/.dockerignore
```
Expected: the four lines above.

- [ ] **Step 3: Commit**

```bash
git add frontend/.dockerignore
git commit -m "chore(frontend): add .dockerignore"
```

---

### Task 5: Frontend `Dockerfile`

**Files:**
- Create: `frontend/Dockerfile`

The runner stage copies only the standalone bundle, static assets, and public files — no full `node_modules`.

- [ ] **Step 1: Create the Dockerfile**

```dockerfile
# ── Stage 1: build ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: runtime ────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 2: Verify the build locally**

Run from `inventory-manager/`:
```bash
docker build -t inventory-frontend ./frontend
```
Expected: build completes, both stages succeed, final image tagged `inventory-frontend`.

- [ ] **Step 3: Commit**

```bash
git add frontend/Dockerfile
git commit -m "chore(frontend): add multi-stage Dockerfile"
```

---

### Task 6: `docker-compose.yml`

**Files:**
- Create: `docker-compose.yml` (at `inventory-manager/`)

- [ ] **Step 1: Create the file**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      AUTH0_DOMAIN: ${AUTH0_DOMAIN}
      AUTH0_AUDIENCE: ${AUTH0_AUDIENCE}
      FRONTEND_URL: http://localhost:3000
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
    environment:
      AUTH0_SECRET: ${AUTH0_SECRET}
      AUTH0_BASE_URL: ${AUTH0_BASE_URL}
      AUTH0_ISSUER_BASE_URL: ${AUTH0_ISSUER_BASE_URL}
      AUTH0_CLIENT_ID: ${AUTH0_CLIENT_ID}
      AUTH0_CLIENT_SECRET: ${AUTH0_CLIENT_SECRET}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

- [ ] **Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose for local development"
```

---

### Task 7: `.env.example`

**Files:**
- Create: `.env.example` (at `inventory-manager/`)

- [ ] **Step 1: Create the file**

```bash
# ── Postgres ─────────────────────────────────────────────────────
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory

# ── Backend (Auth0) ───────────────────────────────────────────────
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://inventory-api

# ── Frontend (Auth0) ──────────────────────────────────────────────
# AUTH0_SECRET: run `openssl rand -hex 32` to generate
AUTH0_SECRET=replace-with-32-byte-hex-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# ── Inter-service ─────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add .env.example with all required variables"
```

---

### Task 8: Smoke test full stack

- [ ] **Step 1: Copy and fill in env file**

```bash
cp .env.example .env
# Edit .env — fill in AUTH0_* values from your Auth0 dashboard
```

- [ ] **Step 2: Start all services**

```bash
docker compose up --build
```

Expected output (order may vary):
- `postgres` becomes healthy
- `backend` logs `prisma migrate deploy` output then `Nest application successfully started`
- `frontend` logs `ready started server on 0.0.0.0:3000`

- [ ] **Step 3: Verify backend health**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
```
Expected: `401` (JWT guard is active — a 401 means the server is up and responding)

- [ ] **Step 4: Verify frontend responds**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200` or `307` (redirect to login)

- [ ] **Step 5: Tear down**

```bash
docker compose down
```

- [ ] **Step 6: Commit any fixes discovered during smoke test, then push**

```bash
git push origin <current-branch>
```
