# User Avatar & Logout Dropdown — Design Spec

**Date:** 2026-04-06
**Status:** Approved

---

## Overview

Replace the plain-text user footer in the sidebar with a Fluent UI `Avatar` that shows the user's initials. Clicking the avatar opens a dropdown menu with the user's name and role as a header, and a "Sign out" action.

---

## Architecture

No new files. The change is contained entirely within `frontend/components/shell/Sidebar.tsx`.

- Fluent UI `Menu`, `MenuTrigger`, `MenuPopover`, `MenuList`, `MenuItem`, `MenuDivider` are added for the dropdown.
- Fluent UI `Avatar` renders the user's initials with an auto-assigned color keyed to the name string.
- Sign out navigates to `/auth/logout` (Auth0's built-in logout route, already used by the app).

---

## Component Design

### Avatar
- Rendered inside a `MenuTrigger` so it is the click target for the dropdown.
- `name` prop set to `user?.name ?? 'User'` — Fluent UI derives initials and color automatically.
- `size` 36 (fits the existing sidebar footer padding).
- `aria-label` set to the user's name for accessibility.

### Dropdown (MenuPopover → MenuList)
```
┌──────────────────────┐
│  Jane Smith          │  ← Body1Strong (non-interactive)
│  MANAGER             │  ← Caption1, muted color
├──────────────────────┤
│  Sign out            │  ← MenuItem, navigates to /auth/logout
└──────────────────────┘
```

- The name/role header is rendered as a non-interactive `div` inside `MenuList` (not a `MenuItem`) so it is not keyboard-selectable.
- `MenuDivider` separates the header from actions.
- "Sign out" uses an `<a href="/auth/logout">` wrapped in `MenuItem` (Auth0 logout requires a full page navigation, not a client-side route).

---

## Data Flow

No new data fetching. The existing `useAuth()` hook in `Sidebar.tsx` already provides `user` and `role` — both are passed directly to the avatar and menu header.

---

## Error Handling

- If `user` is `undefined` (loading), the avatar falls back to `name="User"` (shows "U" initials). No spinner needed — the sidebar is only rendered inside the authenticated layout which already ensures a session exists.

---

## Testing

- `Sidebar.test.tsx` should assert the avatar renders with the user's initials.
- Test that the menu opens on avatar click and shows the user's name, role, and a "Sign out" link pointing to `/auth/logout`.
- Existing sidebar nav tests are unaffected.
