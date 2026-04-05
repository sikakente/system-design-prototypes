# Role Sync: Auth0 app_metadata + JWT Claims

**Date:** 2026-04-06
**Status:** Approved

## Problem

The frontend reads the user's role from the `https://inventory/role` JWT claim, which Auth0 never sets. This means every user appears as `STAFF` on the frontend regardless of their actual DB role, hiding role-gated UI (Team page role dropdowns, Add Product button, etc).

The backend correctly resolves roles from the local `User` table and works fine. The gap is purely in the frontend role resolution.

## Solution

1. Auth0 Post-Login Action injects `app_metadata.role` into the JWT as `https://inventory/role`
2. Backend calls Auth0 Management API to sync `app_metadata.role` whenever a user's role is updated in the DB

This keeps the DB as the source of truth while making the role available in the JWT for frontend use.

## Auth0 Dashboard Setup

### M2M Application
- Create a new **Machine to Machine** application named `Inventory Backend (Dev)`
- Authorize it against the **Auth0 Management API**
- Grant only the `update:users` scope

### Environment Variables (backend/.env)
```
AUTH0_MGMT_CLIENT_ID=<m2m client id>
AUTH0_MGMT_CLIENT_SECRET=<m2m client secret>
```

### Post-Login Action
Deploy a Post-Login Action in Auth0 with the following logic:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const role = event.user.app_metadata?.role ?? 'STAFF';
  api.idToken.setCustomClaim('https://inventory/role', role);
  api.accessToken.setCustomClaim('https://inventory/role', role);
  api.accessToken.setCustomClaim('https://inventory/email', event.user.email);
  api.accessToken.setCustomClaim('https://inventory/name', event.user.name);
};
```

## Backend Changes

### New: `Auth0ManagementService` (`src/auth/auth0-management.service.ts`)
- Instantiates Auth0 `ManagementClient` using `AUTH0_DOMAIN`, `AUTH0_MGMT_CLIENT_ID`, `AUTH0_MGMT_CLIENT_SECRET`
- Exposes `syncRole(auth0Id: string, role: Role): Promise<void>`
- Calls `managementClient.users.update({ id: auth0Id }, { app_metadata: { role } })`
- Errors are logged but do not throw — DB write succeeds regardless of Auth0 sync failure

### Modified: `UsersService.update()`
- After the `prisma.user.update()` call, call `auth0ManagementService.syncRole(user.auth0Id, dto.role)` if `dto.role` is present
- `Auth0ManagementService` is injected into `UsersService`

### Modified: `AuthModule`
- Register `Auth0ManagementService` as a provider
- Export it so `UsersModule` can use it

## Frontend Changes

None. `AuthContext` already reads `https://inventory/role` from the JWT via `user?.['https://inventory/role']`.

## Data Flow

```
Admin changes role in Team page
  → PATCH /users/:id (backend)
    → prisma.user.update() [DB write]
    → auth0Management.syncRole() [app_metadata update]
  → User re-logs in / token refreshes
    → Post-Login Action runs
      → Injects app_metadata.role into JWT
  → Frontend reads updated role from JWT claim
```

## Token Refresh Behaviour

A user's existing JWT will not reflect a role change until it expires or they re-login. The Team page should display a note that role changes take effect on next login.

## Error Handling

- If Auth0 Management API call fails, log the error but do not fail the HTTP request — the DB is the source of truth
- The backend strategy already falls back to `dbUser.role` so backend auth is unaffected

## Dependencies

- `auth0` npm package (backend) — provides `ManagementClient` with built-in token caching
