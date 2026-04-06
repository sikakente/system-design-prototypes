# User Avatar & Logout Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain-text user footer in the sidebar with a Fluent UI `Avatar` that opens a dropdown showing the user's name, role, and a "Sign out" link.

**Architecture:** Modify only `Sidebar.tsx` — the existing `useAuth()` hook already provides `user` and `role`. The avatar triggers a Fluent UI `Menu` popover. Sign out navigates to `/auth/logout` via a full page redirect (required by Auth0).

**Tech Stack:** Fluent UI v9 (`@fluentui/react-components` 9.73.7), `@fluentui/react-icons`, `@auth0/nextjs-auth0`, Vitest + Testing Library

---

### Task 1: Update Sidebar tests for avatar and dropdown

**Files:**
- Modify: `frontend/components/shell/Sidebar.test.tsx`

- [ ] **Step 1: Expand the Fluent UI mock to include new components**

Replace the existing `@fluentui/react-components` mock block with:

```tsx
vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Text: ({ children }: any) => <span>{children}</span>,
  Body1: ({ children }: any) => <span>{children}</span>,
  Body1Strong: ({ children }: any) => <span>{children}</span>,
  Caption1: ({ children }: any) => <span>{children}</span>,
  Avatar: ({ name, 'aria-label': ariaLabel }: any) => (
    <button aria-label={ariaLabel ?? name}>{name}</button>
  ),
  Menu: ({ children }: any) => <div>{children}</div>,
  MenuTrigger: ({ children }: any) => <div>{children}</div>,
  MenuPopover: ({ children }: any) => <div>{children}</div>,
  MenuList: ({ children }: any) => <div>{children}</div>,
  MenuDivider: () => <hr />,
  MenuItem: ({ children, onClick }: any) => (
    <button role="menuitem" onClick={onClick}>{children}</button>
  ),
}));
```

Also add `SignOut20Regular` to the `@fluentui/react-icons` mock:

```tsx
vi.mock('@fluentui/react-icons', () => ({
  Home20Regular: () => <svg />,
  Box20Regular: () => <svg />,
  Tag20Regular: () => <svg />,
  Alert20Regular: () => <svg />,
  People20Regular: () => <svg />,
  SignOut20Regular: () => <svg />,
}));
```

- [ ] **Step 2: Replace the existing "shows user name in footer" test and add new tests**

Remove the test `'shows user name in footer'` and replace with:

```tsx
it('renders avatar with user initials accessible label', () => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: { name: 'Alice Smith' } as any,
    role: 'STAFF',
    isLoading: false,
  });
  render(<Sidebar />);
  expect(screen.getByRole('button', { name: 'Alice Smith' })).toBeInTheDocument();
});

it('shows user name and role in the dropdown header', () => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: { name: 'Alice Smith' } as any,
    role: 'MANAGER',
    isLoading: false,
  });
  render(<Sidebar />);
  expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  expect(screen.getByText('MANAGER')).toBeInTheDocument();
});

it('renders a sign out menu item linking to /auth/logout', () => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: { name: 'Alice Smith' } as any,
    role: 'STAFF',
    isLoading: false,
  });
  render(<Sidebar />);
  expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
});

it('falls back to "User" when user is undefined', () => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: undefined,
    role: 'STAFF',
    isLoading: true,
  });
  render(<Sidebar />);
  expect(screen.getByRole('button', { name: 'User' })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
cd frontend && npx vitest run components/shell/Sidebar.test.tsx
```

Expected: failures on the new tests (avatar, dropdown header, sign out item).

- [ ] **Step 4: Commit failing tests**

```bash
git add frontend/components/shell/Sidebar.test.tsx
git commit -m "test(sidebar): add failing tests for avatar and logout dropdown"
```

---

### Task 2: Implement avatar and logout dropdown in Sidebar

**Files:**
- Modify: `frontend/components/shell/Sidebar.tsx`

- [ ] **Step 1: Update imports**

Replace the existing import from `@fluentui/react-components`:

```tsx
import {
  makeStyles,
  tokens,
  Text,
  Body1,
  Body1Strong,
  Caption1,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuDivider,
  MenuItem,
} from '@fluentui/react-components';
import { SignOut20Regular } from '@fluentui/react-icons';
```

Keep all other existing imports (`@fluentui/react-icons` nav icons, `Link`, `usePathname`, `useAuth`, `RoleGuard`) as-is.

- [ ] **Step 2: Add footer styles**

Inside `useStyles`, replace the existing `footer` style with:

```ts
footer: {
  padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  cursor: 'pointer',
},
menuHeader: {
  padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacingVerticalXXS,
  minWidth: '160px',
},
menuRole: {
  color: tokens.colorNeutralForeground3,
},
```

- [ ] **Step 3: Replace the footer JSX**

Replace the existing `<div className={styles.footer}>` block:

```tsx
<div className={styles.footer}>
  <Body1>{user?.name ?? 'User'}</Body1>
  <br />
  <Text size={200}>{role}</Text>
</div>
```

with:

```tsx
<Menu>
  <MenuTrigger disableButtonEnhancement>
    <div className={styles.footer}>
      <Avatar
        name={user?.name ?? 'User'}
        size={36}
        aria-label={user?.name ?? 'User'}
      />
    </div>
  </MenuTrigger>
  <MenuPopover>
    <MenuList>
      <div className={styles.menuHeader}>
        <Body1Strong>{user?.name ?? 'User'}</Body1Strong>
        <Caption1 className={styles.menuRole}>{role}</Caption1>
      </div>
      <MenuDivider />
      <MenuItem
        icon={<SignOut20Regular />}
        onClick={() => { window.location.href = '/auth/logout'; }}
      >
        Sign out
      </MenuItem>
    </MenuList>
  </MenuPopover>
</Menu>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd frontend && npx vitest run components/shell/Sidebar.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 5: Commit implementation**

```bash
git add frontend/components/shell/Sidebar.tsx
git commit -m "feat(sidebar): replace user footer with avatar and logout dropdown"
```
