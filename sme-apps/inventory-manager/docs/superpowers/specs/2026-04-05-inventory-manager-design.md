# Inventory Manager — Full-Stack Design Spec

**Date:** 2026-04-05
**Stack:** Next.js (App Router) + NestJS + PostgreSQL + Auth0
**Scope:** Product/stock tracking for small teams

---

## Overview

A web-based inventory manager for SMEs. Primary use case: product/stock tracking with quantity management and reorder alerts. Used by small teams (multiple staff) with three permission levels. Frontend built with Next.js App Router and Microsoft Fluent 2 UI. Backend is a NestJS REST API backed by PostgreSQL via Prisma. Authentication and authorization handled by Auth0.

---

## Architecture

```
inventory-manager/
├── frontend/    # Next.js App Router (port 3000)
├── backend/     # NestJS REST API (port 3001)
└── package.json # Root — concurrently script for dev
```

**Data flow:**

```
Next.js (SWR hooks)
  → HTTP requests with Auth0 JWT → NestJS REST API
    → NestJS service layer
      → Prisma Client
        → PostgreSQL
```

**Dev workflow:**
```json
"dev": "concurrently \"npm run dev --prefix frontend\" \"npm run start:dev --prefix backend\""
```

---

## Frontend

### Shell Layout

Persistent left sidebar with:
- Logo + app name at top
- Navigation links: Dashboard, Products, Categories, Reorder Alerts, Team
- Current user name + role at bottom
- Main content area to the right

### Routing Structure

```
app/
├── layout.tsx                   # Root layout (fonts, Auth0 provider)
├── (auth)/
│   └── login/page.tsx           # Redirects to Auth0 Universal Login
├── (app)/
│   ├── layout.tsx               # Shell layout (sidebar + header)
│   ├── dashboard/page.tsx
│   ├── products/
│   │   ├── page.tsx             # Products list
│   │   └── [id]/page.tsx        # Product detail / edit / create
│   ├── categories/page.tsx
│   ├── alerts/page.tsx          # Reorder alerts
│   └── team/page.tsx            # Team management (Manager + Admin only)
```

### Component Structure

```
components/
├── shell/
│   ├── AppShell.tsx             # Sidebar + main content wrapper
│   ├── AppShell.test.tsx
│   ├── Sidebar.tsx              # Nav links, logo, user info
│   ├── Sidebar.test.tsx
│   ├── Header.tsx               # Page title, breadcrumbs, action slot
│   └── Header.test.tsx
├── products/
│   ├── ProductsTable.tsx        # Fluent 2 DataGrid with search/filter
│   ├── ProductsTable.test.tsx
│   ├── ProductForm.tsx          # Create/edit form (Drawer)
│   ├── ProductForm.test.tsx
│   ├── StockBadge.tsx           # Color-coded quantity indicator
│   └── StockBadge.test.tsx
├── dashboard/
│   ├── StatCard.tsx             # Metric tile
│   ├── StatCard.test.tsx
│   ├── ActivityFeed.tsx         # Recent changes list (derived from updatedAt on products — no separate audit log)
│   └── LowStockPanel.tsx        # Quick-view alerts widget
├── alerts/
│   ├── AlertsTable.tsx
│   └── AlertsTable.test.tsx
├── categories/
│   ├── CategoriesGrid.tsx
│   └── CategoriesGrid.test.tsx
├── team/
│   ├── TeamTable.tsx
│   └── TeamTable.test.tsx
└── shared/
    ├── RoleGuard.tsx            # Hides/disables UI by role
    ├── RoleGuard.test.tsx
    ├── EmptyState.tsx
    └── ConfirmDialog.tsx
```

### Data Fetching

- **SWR** for all data fetching — `hooks/useProducts`, `useCategories`, `useAlerts`, `useTeam`
- `lib/api.ts` — fetch wrapper that reads `NEXT_PUBLIC_API_URL` and attaches Auth0 access token to every request
- `contexts/AuthContext.tsx` — wraps Auth0 `useUser()`, exposes `role` extracted from custom claim `https://inventory/role`

### Auth (Frontend)

- Package: `@auth0/nextjs-auth0`
- Login/logout delegated to Auth0 Universal Login
- `useUser()` provides session; role read from custom claim
- `(app)/layout.tsx` redirects unauthenticated users to `/login`
- Staff redirected away from `/team` route

### Testing

- **Vitest + React Testing Library + jest-dom**
- **msw** for mocking API calls in hook tests
- Priority tests:
  - `RoleGuard` — role-based render enforcement
  - `ProductForm` — validation logic
  - `StockBadge` — threshold color rendering
  - `Sidebar` — active nav state
  - SWR hooks — mock fetch responses via msw

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3001
AUTH0_SECRET
AUTH0_BASE_URL
AUTH0_ISSUER_BASE_URL
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
```

---

## Backend

### Module Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.service.spec.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # GET /auth/me
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.service.ts         # User upsert on first login
│   │   ├── auth.service.spec.ts
│   │   ├── auth0.strategy.ts       # Validates Auth0 JWT via JWKS
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.controller.spec.ts
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.controller.spec.ts
│   │   ├── products.service.ts
│   │   └── products.service.spec.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.controller.spec.ts
│   │   ├── categories.service.ts
│   │   └── categories.service.spec.ts
│   └── alerts/
│       ├── alerts.module.ts
│       ├── alerts.service.ts        # Derived — queries products below threshold
│       └── alerts.service.spec.ts
└── test/
    └── app.e2e-spec.ts              # E2E smoke test (auth + products flow)
```

### Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  auth0Id   String   @unique
  email     String   @unique
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id               String   @id @default(cuid())
  name             String
  sku              String   @unique
  quantity         Int      @default(0)
  reorderThreshold Int      @default(10)
  unit             String?
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id])
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum Role {
  ADMIN
  MANAGER
  STAFF
}
```

Alerts are derived — no separate table. Queried as `Product` where `quantity <= reorderThreshold`.

### API Endpoints

```
GET    /auth/me                  # Upsert user from Auth0 token, return profile

GET    /products                 # List all (?search=, ?categoryId=, ?lowStock=true)
POST   /products                 # Create — MANAGER, ADMIN
GET    /products/:id             # Get single product
PATCH  /products/:id             # Update — MANAGER/ADMIN full edit; STAFF may only update `quantity` field (other fields rejected with 403)
DELETE /products/:id             # Delete — MANAGER, ADMIN

GET    /categories               # List all with product count
POST   /categories               # Create — MANAGER, ADMIN
PATCH  /categories/:id           # Rename — MANAGER, ADMIN
DELETE /categories/:id           # Delete — ADMIN only

GET    /alerts                   # Products where quantity <= reorderThreshold
PATCH  /alerts/:productId        # Update reorderThreshold — MANAGER, ADMIN

GET    /users                    # List team — MANAGER, ADMIN
POST   /users                    # Create member — ADMIN only
PATCH  /users/:id                # Update name/role — ADMIN only
DELETE /users/:id                # Remove member — ADMIN only
```

### Auth (Backend)

- Auth0 JWT validated via JWKS URI (`passport-jwt` + `jwks-rsa`)
- `JwtAuthGuard` applied globally; public routes marked `@Public()`
- `@Roles()` decorator + `RolesGuard` enforces role at controller/handler level
- Role read from custom claim `https://inventory/role` in JWT payload
- On `GET /auth/me`, `AuthService` upserts user in PostgreSQL (`auth0Id` as unique key)

### Testing

- **Unit tests** — service logic with mocked `PrismaService`; controller tests with mocked services
- **E2E test** — `supertest` against real test database (`TEST_DATABASE_URL`)
- Jest (NestJS default)

### Environment Variables

```
DATABASE_URL=postgresql://...
TEST_DATABASE_URL=postgresql://...
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://inventory-api
```

---

## Role Permissions

| Action | Staff | Manager | Admin |
|---|---|---|---|
| View dashboard, products, alerts | ✅ | ✅ | ✅ |
| Update stock quantities | ✅ | ✅ | ✅ |
| Add / edit products & categories | ❌ | ✅ | ✅ |
| Delete products / categories | ❌ | ✅ | ✅ |
| Manage reorder thresholds | ❌ | ✅ | ✅ |
| View team page | ❌ | ✅ | ✅ |
| Add / remove team members | ❌ | ❌ | ✅ |
| Change member roles | ❌ | ❌ | ✅ |

---

## Error Handling

- **Frontend** — Fluent 2 `MessageBar` for inline operation errors; `not-found.tsx` for invalid routes; `EmptyState` with CTA for empty lists
- **Backend** — NestJS built-in exception filters; `NotFoundException`, `ForbiddenException`, `BadRequestException` from service layer; global validation pipe with `class-validator` DTOs
- Role violations — hidden UI elements on frontend; 403 response from backend
