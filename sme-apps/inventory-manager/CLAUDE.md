# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack inventory management system (SME-focused) with a NestJS backend API and Next.js frontend. Uses Auth0 for authentication with a three-tier role model (ADMIN, MANAGER, STAFF).

## Commands

### Full Stack
```bash
npm run dev            # Start both frontend (:3000) and backend (:3001) concurrently
npm run test:backend   # Run backend tests
npm run test:frontend  # Run frontend tests
```

### Backend (`cd backend` or use `--prefix backend`)
```bash
npm run start:dev      # Dev server with watch mode
npm run build          # Compile TypeScript
npm run lint           # ESLint with auto-fix
npm run format         # Prettier format
npm test               # Jest unit tests
npm run test:watch     # Jest in watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # End-to-end tests
npx prisma migrate dev # Run DB migrations
npx prisma studio      # GUI for database
```

### Frontend (`cd frontend` or use `--prefix frontend`)
```bash
npm run dev            # Next.js dev server
npm run build          # Production build
npm run lint           # ESLint
npm test               # Vitest
npm run test:watch     # Vitest in watch mode
```

### Running a single test
```bash
# Backend (Jest)
cd backend && npx jest path/to/test.spec.ts
cd backend && npx jest --testNamePattern="test name"

# Frontend (Vitest)
cd frontend && npx vitest run path/to/test.ts
```

## Architecture

### Backend (NestJS — `backend/`)

Module-per-domain structure with global `JwtAuthGuard` and `RolesGuard` applied to all routes. Auth is via Auth0 JWT tokens validated with `jwks-rsa`.

- **`src/auth/`** — Auth0 Passport strategy, JWT guard, roles guard, `@Roles()` decorator
- **`src/products/`** — Products CRUD; role-based filtering in service layer
- **`src/categories/`** — Category management
- **`src/alerts/`** — Low-stock alert logic (products below `reorderThreshold`)
- **`src/users/`** — User management (syncs Auth0 identity to local DB)
- **`src/prisma/`** — `PrismaService` singleton shared across all modules
- **`prisma/schema.prisma`** — Source of truth for DB schema

**Database** (PostgreSQL via Prisma): `User` (auth0Id, role), `Product` (sku, quantity, reorderThreshold, categoryId), `Category`. Configure via `DATABASE_URL` env var.

### Frontend (Next.js — `frontend/`)

> **Next.js 16 note**: This uses Next.js 16 which has breaking changes from prior versions. Before writing code, read relevant guides in `node_modules/next/dist/docs/`. Heed deprecation notices.

App Router layout with two route groups:
- **`app/(app)/`** — Protected pages (dashboard, products, categories, alerts, team)
- **`app/(auth)/`** — Auth pages (login)
- **`app/api/auth/token/`** — Token relay endpoint for backend calls

**Data layer**: All API calls go through `lib/api.ts` which injects Auth0 tokens. Custom SWR hooks in `hooks/` wrap each domain (useProducts, useCategories, useAlerts, useTeam) and expose loading/error states plus mutation helpers.

**UI**: Fluent UI (`@fluentui/react-components`) as the component library, wrapped in `FluentWrapper.tsx` for theme provider setup.

**Auth**: Auth0 via `@auth0/nextjs-auth0`. `AuthContext` in `contexts/` exposes user/role. `RoleGuard` component in `components/shared/` gates UI by role.

**Testing**: Vitest + Testing Library + MSW for request mocking.
