# Inventory Manager Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js App Router frontend with Fluent 2 UI, Auth0 authentication, SWR data fetching, and role-based access, connected to the NestJS backend API.

**Architecture:** App Router with a `(app)` route group for the protected shell layout and `(auth)` for login. Auth0 handles authentication; role is read from a custom JWT claim. SWR hooks call a `lib/api.ts` fetch wrapper that attaches the Auth0 access token. Fluent 2's `FluentProvider` wraps the entire app.

**Tech Stack:** Next.js 14 (App Router), `@fluentui/react-components`, `@fluentui/react-icons`, `@auth0/nextjs-auth0`, SWR, Vitest, React Testing Library, `msw`

**Prerequisite:** Backend is running at `http://localhost:3001`. Complete the backend plan first.

---

## File Map

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── .env.local
├── app/
│   ├── layout.tsx                         # Root: FluentProvider + UserProvider
│   ├── (auth)/
│   │   ├── login/page.tsx                 # Redirects to Auth0
│   │   └── api/auth/[auth0]/route.ts      # Auth0 handler
│   └── (app)/
│       ├── layout.tsx                     # Shell: auth guard + AppShell
│       ├── dashboard/page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── categories/page.tsx
│       ├── alerts/page.tsx
│       └── team/page.tsx
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx
│   │   ├── AppShell.test.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.test.tsx
│   │   ├── Header.tsx
│   │   └── Header.test.tsx
│   ├── shared/
│   │   ├── RoleGuard.tsx
│   │   ├── RoleGuard.test.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── StatCard.test.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── LowStockPanel.tsx
│   ├── products/
│   │   ├── ProductsTable.tsx
│   │   ├── ProductsTable.test.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductForm.test.tsx
│   │   ├── StockBadge.tsx
│   │   └── StockBadge.test.tsx
│   ├── categories/
│   │   ├── CategoriesGrid.tsx
│   │   └── CategoriesGrid.test.tsx
│   ├── alerts/
│   │   ├── AlertsTable.tsx
│   │   └── AlertsTable.test.tsx
│   └── team/
│       ├── TeamTable.tsx
│       └── TeamTable.test.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useProducts.ts
│   ├── useProducts.test.ts
│   ├── useCategories.ts
│   ├── useAlerts.ts
│   └── useTeam.ts
└── lib/
    └── api.ts
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`
- Create: `frontend/.env.local`

- [ ] **Step 1: Scaffold the project**

```bash
cd inventory-manager
npx create-next-app@latest frontend \
  --typescript \
  --tailwind=false \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
cd frontend
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @fluentui/react-components @fluentui/react-icons @auth0/nextjs-auth0 swr
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jsdom
```

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
```

- [ ] **Step 5: Write `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Add test script to `package.json`**

In `frontend/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Create `.env.local`**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
AUTH0_SECRET=use-openssl-rand-base64-32-to-generate
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://inventory-api
```

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Next.js project with Vitest"
```

---

## Task 2: Auth0 Integration

**Files:**
- Create: `frontend/app/api/auth/[auth0]/route.ts`
- Create: `frontend/app/api/auth/token/route.ts`
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/layout.tsx`

- [ ] **Step 1: Write `app/api/auth/[auth0]/route.ts`**

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

- [ ] **Step 2: Write `app/api/auth/token/route.ts`**

This endpoint is called by `lib/api.ts` to get the access token for backend API calls.

```typescript
import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { accessToken } = await getAccessToken({
      authorizationParams: { audience: process.env.AUTH0_AUDIENCE },
    });
    return NextResponse.json({ accessToken: accessToken ?? null });
  } catch {
    return NextResponse.json({ accessToken: null });
  }
}
```

- [ ] **Step 3: Write `app/(auth)/login/page.tsx`**

```tsx
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/api/auth/login');
}
```

- [ ] **Step 4: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

export const metadata: Metadata = { title: 'StockFlow' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <UserProvider>
          <FluentProvider theme={webLightTheme}>
            {children}
          </FluentProvider>
        </UserProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat(frontend): add Auth0 integration and root layout"
```

---

## Task 3: AuthContext and RoleGuard

**Files:**
- Create: `frontend/contexts/AuthContext.tsx`
- Create: `frontend/components/shared/RoleGuard.tsx`
- Create: `frontend/components/shared/RoleGuard.test.tsx`

- [ ] **Step 1: Write failing tests for `RoleGuard`**

```tsx
// components/shared/RoleGuard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleGuard } from './RoleGuard';
import * as AuthContextModule from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('RoleGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders children when user role meets minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'ADMIN',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>secret</span></RoleGuard>);
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('renders nothing when role is below minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'STAFF',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>secret</span></RoleGuard>);
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders fallback when role is below minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'STAFF',
      isLoading: false,
    });
    render(
      <RoleGuard minRole="MANAGER" fallback={<span>no access</span>}>
        <span>secret</span>
      </RoleGuard>,
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('no access')).toBeInTheDocument();
  });

  it('renders children when role exactly meets minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'MANAGER',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>allowed</span></RoleGuard>);
    expect(screen.getByText('allowed')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test
```

Expected: FAIL with "Cannot find module './RoleGuard'"

- [ ] **Step 3: Write `contexts/AuthContext.tsx`**

```tsx
'use client';
import { createContext, useContext } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

interface AuthContextValue {
  user: ReturnType<typeof useUser>['user'];
  role: Role;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  role: 'STAFF',
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const role = ((user?.['https://inventory/role'] as string | undefined)?.toUpperCase() as Role) ?? 'STAFF';

  return (
    <AuthContext.Provider value={{ user, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 4: Write `components/shared/RoleGuard.tsx`**

```tsx
'use client';
import { useAuth, type Role } from '../../contexts/AuthContext';

const ROLE_RANK: Record<Role, number> = { STAFF: 0, MANAGER: 1, ADMIN: 2 };

interface RoleGuardProps {
  minRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ minRole, children, fallback = null }: RoleGuardProps) {
  const { role } = useAuth();
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) return <>{fallback}</>;
  return <>{children}</>;
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test
```

Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add contexts/ components/shared/RoleGuard.tsx components/shared/RoleGuard.test.tsx
git commit -m "feat(frontend): add AuthContext and RoleGuard"
```

---

## Task 4: App Shell (AppShell, Sidebar, Header)

**Files:**
- Create: `frontend/components/shell/AppShell.tsx`
- Create: `frontend/components/shell/AppShell.test.tsx`
- Create: `frontend/components/shell/Sidebar.tsx`
- Create: `frontend/components/shell/Sidebar.test.tsx`
- Create: `frontend/components/shell/Header.tsx`
- Create: `frontend/components/shell/Header.test.tsx`
- Create: `frontend/app/(app)/layout.tsx`

- [ ] **Step 1: Write failing test for `Sidebar`**

```tsx
// components/shell/Sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import * as AuthContextModule from '../../contexts/AuthContext';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children, minRole }: any) =>
    minRole === 'MANAGER' ? null : children,
}));

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Text: ({ children }: any) => <span>{children}</span>,
  Body1: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Home20Regular: () => <svg />,
  Box20Regular: () => <svg />,
  Tag20Regular: () => <svg />,
  Alert20Regular: () => <svg />,
  People20Regular: () => <svg />,
}));

describe('Sidebar', () => {
  it('renders nav links', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice' } as any,
      role: 'ADMIN',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Reorder Alerts')).toBeInTheDocument();
  });

  it('shows user name in footer', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice' } as any,
      role: 'STAFF',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test
```

Expected: FAIL with "Cannot find module './Sidebar'"

- [ ] **Step 3: Write `components/shell/Sidebar.tsx`**

```tsx
'use client';
import {
  makeStyles,
  tokens,
  Text,
  Body1,
} from '@fluentui/react-components';
import {
  Home20Regular,
  Box20Regular,
  Tag20Regular,
  Alert20Regular,
  People20Regular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../shared/RoleGuard';

const useStyles = makeStyles({
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingVerticalM,
  },
  logo: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: tokens.spacingVerticalM,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flex: '1',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
  },
  active: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  footer: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home20Regular },
  { href: '/products', label: 'Products', Icon: Box20Regular },
  { href: '/categories', label: 'Categories', Icon: Tag20Regular },
  { href: '/alerts', label: 'Reorder Alerts', Icon: Alert20Regular },
];

export function Sidebar() {
  const styles = useStyles();
  const pathname = usePathname();
  const { user, role } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Text weight="bold" size={500}>📦 StockFlow</Text>
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link}${pathname.startsWith(href) ? ` ${styles.active}` : ''}`}
          >
            <Icon />
            <Body1>{label}</Body1>
          </Link>
        ))}
        <RoleGuard minRole="MANAGER">
          <Link
            href="/team"
            className={`${styles.link}${pathname === '/team' ? ` ${styles.active}` : ''}`}
          >
            <People20Regular />
            <Body1>Team</Body1>
          </Link>
        </RoleGuard>
      </nav>
      <div className={styles.footer}>
        <Body1>{user?.name ?? 'User'}</Body1>
        <br />
        <Text size={200}>{role}</Text>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Run Sidebar test — expect PASS**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Write `components/shell/Header.tsx`**

```tsx
'use client';
import { makeStyles, tokens, Title3 } from '@fluentui/react-components';

const useStyles = makeStyles({
  header: {
    height: '56px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const styles = useStyles();
  return (
    <header className={styles.header}>
      <Title3>{title}</Title3>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
```

- [ ] **Step 6: Write `components/shell/Header.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Title3: ({ children }: any) => <h3>{children}</h3>,
}));

describe('Header', () => {
  it('renders title', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<Header title="Products" actions={<button>Add</button>} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Write `components/shell/AppShell.tsx`**

```tsx
'use client';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 8: Write `components/shell/AppShell.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell';

vi.mock('./Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}));

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
}));

describe('AppShell', () => {
  it('renders sidebar and children', () => {
    render(<AppShell><p>page content</p></AppShell>);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Write `app/(app)/layout.tsx`**

```tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppShell } from '../../components/shell/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
```

- [ ] **Step 10: Run all tests — expect PASS**

```bash
npm test
```

Expected: PASS (all shell tests)

- [ ] **Step 11: Commit**

```bash
git add app/ components/shell/ contexts/
git commit -m "feat(frontend): add app shell with Sidebar, Header, and AppShell"
```

---

## Task 5: API Fetch Layer and SWR Hooks

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/hooks/useProducts.ts`
- Create: `frontend/hooks/useProducts.test.ts`
- Create: `frontend/hooks/useCategories.ts`
- Create: `frontend/hooks/useAlerts.ts`
- Create: `frontend/hooks/useTeam.ts`

- [ ] **Step 1: Write `lib/api.ts`**

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

let tokenCache: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  try {
    const res = await fetch('/api/auth/token');
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken: string | null };
    if (accessToken) {
      tokenCache = { value: accessToken, expiresAt: Date.now() + 50 * 60 * 1000 };
    }
    return accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

- [ ] **Step 2: Write failing test for `useProducts`**

```typescript
// hooks/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts } from './useProducts';
import * as apiModule from '../lib/api';

vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('swr', () => ({
  default: (key: string, fetcher: (k: string) => unknown) => {
    const data = fetcher ? fetcher(key) : undefined;
    return { data, isLoading: false, error: undefined };
  },
}));

const products = [
  { id: 'p1', name: 'Widget', sku: 'WGT-001', quantity: 10, reorderThreshold: 5, categoryId: 'cat1', category: { id: 'cat1', name: 'Electronics' }, createdAt: '', updatedAt: '' },
];

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches products from /products', () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue(products);
    const { result } = renderHook(() => useProducts());
    expect(apiModule.apiFetch).toHaveBeenCalledWith('/products?');
  });

  it('appends search query param', () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue([]);
    renderHook(() => useProducts({ search: 'widget' }));
    expect(apiModule.apiFetch).toHaveBeenCalledWith('/products?search=widget');
  });

  it('appends lowStock=true query param', () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue([]);
    renderHook(() => useProducts({ lowStock: true }));
    expect(apiModule.apiFetch).toHaveBeenCalledWith('/products?lowStock=true');
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm test
```

Expected: FAIL with "Cannot find module './useProducts'"

- [ ] **Step 4: Write `hooks/useProducts.ts`**

```typescript
import useSWR from 'swr';
import { apiFetch } from '../lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  unit?: string;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export function useProducts(params?: { search?: string; categoryId?: string; lowStock?: boolean }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.lowStock) query.set('lowStock', 'true');

  return useSWR<Product[]>(`/products?${query}`, (path: string) => apiFetch<Product[]>(path));
}

export const createProduct = (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) =>
  apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id: string, data: Partial<Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>>) =>
  apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteProduct = (id: string) =>
  apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test
```

Expected: PASS

- [ ] **Step 6: Write `hooks/useCategories.ts`**

```typescript
import useSWR from 'swr';
import { apiFetch } from '../lib/api';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  _count: { products: number };
}

export function useCategories() {
  return useSWR<Category[]>('/categories', (path: string) => apiFetch<Category[]>(path));
}

export const createCategory = (data: { name: string }) =>
  apiFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(data) });

export const updateCategory = (id: string, data: { name: string }) =>
  apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteCategory = (id: string) =>
  apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
```

- [ ] **Step 7: Write `hooks/useAlerts.ts`**

```typescript
import useSWR from 'swr';
import { apiFetch } from '../lib/api';
import type { Product } from './useProducts';

export function useAlerts() {
  return useSWR<Product[]>('/alerts', (path: string) => apiFetch<Product[]>(path));
}

export const updateThreshold = (productId: string, reorderThreshold: number) =>
  apiFetch<Product>(`/alerts/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ reorderThreshold }),
  });
```

- [ ] **Step 8: Write `hooks/useTeam.ts`**

```typescript
import useSWR from 'swr';
import { apiFetch } from '../lib/api';

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface TeamMember {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export function useTeam() {
  return useSWR<TeamMember[]>('/users', (path: string) => apiFetch<TeamMember[]>(path));
}

export const updateMember = (id: string, data: { name?: string; role?: Role }) =>
  apiFetch<TeamMember>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteMember = (id: string) =>
  apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
```

- [ ] **Step 9: Commit**

```bash
git add lib/ hooks/
git commit -m "feat(frontend): add API fetch layer and SWR hooks"
```

---

## Task 6: Shared Components

**Files:**
- Create: `frontend/components/shared/EmptyState.tsx`
- Create: `frontend/components/shared/ConfirmDialog.tsx`
- Create: `frontend/components/products/StockBadge.tsx`
- Create: `frontend/components/products/StockBadge.test.tsx`

- [ ] **Step 1: Write failing test for `StockBadge`**

```tsx
// components/products/StockBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StockBadge } from './StockBadge';

vi.mock('@fluentui/react-components', () => ({
  Badge: ({ children, color }: any) => <span data-color={color}>{children}</span>,
}));

describe('StockBadge', () => {
  it('shows danger color when quantity is 0', () => {
    render(<StockBadge quantity={0} threshold={10} />);
    expect(screen.getBySpan('[data-color="danger"]')).toBeDefined();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows warning color when quantity is at or below threshold', () => {
    render(<StockBadge quantity={5} threshold={10} />);
    const badge = screen.getByText('5').closest('[data-color]');
    expect(badge?.getAttribute('data-color')).toBe('warning');
  });

  it('shows success color when quantity is above threshold', () => {
    render(<StockBadge quantity={20} threshold={10} />);
    const badge = screen.getByText('20').closest('[data-color]');
    expect(badge?.getAttribute('data-color')).toBe('success');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- StockBadge
```

Expected: FAIL

- [ ] **Step 3: Write `components/products/StockBadge.tsx`**

```tsx
import { Badge } from '@fluentui/react-components';

interface StockBadgeProps {
  quantity: number;
  threshold: number;
}

export function StockBadge({ quantity, threshold }: StockBadgeProps) {
  const color =
    quantity === 0 ? 'danger' : quantity <= threshold ? 'warning' : 'success';
  return (
    <Badge color={color} appearance="filled">
      {quantity}
    </Badge>
  );
}
```

- [ ] **Step 4: Fix test — `getBySpan` is not a valid RTL query. Update test:**

```tsx
// Fix the test for quantity === 0
it('shows danger color when quantity is 0', () => {
  render(<StockBadge quantity={0} threshold={10} />);
  const badge = screen.getByText('0').closest('[data-color]');
  expect(badge?.getAttribute('data-color')).toBe('danger');
});
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- StockBadge
```

Expected: PASS

- [ ] **Step 6: Write `components/shared/EmptyState.tsx`**

```tsx
import { makeStyles, tokens, Body1, Title3, Button } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
});

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Title3>{title}</Title3>
      {description && <Body1>{description}</Body1>}
      {action && <Button appearance="primary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

- [ ] **Step 7: Write `components/shared/ConfirmDialog.tsx`**

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components';

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>{trigger}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{description}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={onConfirm}>{confirmLabel}</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/shared/ components/products/StockBadge.tsx components/products/StockBadge.test.tsx
git commit -m "feat(frontend): add shared components and StockBadge"
```

---

## Task 7: Dashboard Page

**Files:**
- Create: `frontend/components/dashboard/StatCard.tsx`
- Create: `frontend/components/dashboard/StatCard.test.tsx`
- Create: `frontend/components/dashboard/ActivityFeed.tsx`
- Create: `frontend/components/dashboard/LowStockPanel.tsx`
- Create: `frontend/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Write failing test for `StatCard`**

```tsx
// components/dashboard/StatCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatCard } from './StatCard';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ header }: any) => <div>{header}</div>,
  Body1: ({ children }: any) => <span>{children}</span>,
  Title2: ({ children }: any) => <span>{children}</span>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Items" value={248} />);
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- StatCard
```

Expected: FAIL

- [ ] **Step 3: Write `components/dashboard/StatCard.tsx`**

```tsx
import { makeStyles, tokens, Card, Body1, Title2, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalL,
    minWidth: '140px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    display: 'block',
    marginBottom: tokens.spacingVerticalXS,
  },
});

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: 'default' | 'danger';
}

export function StatCard({ label, value, accent = 'default' }: StatCardProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <Text size={200} className={styles.label}>{label}</Text>
      <Title2 style={{ color: accent === 'danger' ? tokens.colorStatusDangerForeground1 : undefined }}>
        {value}
      </Title2>
    </Card>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- StatCard
```

Expected: PASS

- [ ] **Step 5: Write `components/dashboard/ActivityFeed.tsx`**

```tsx
import { makeStyles, tokens, Card, CardHeader, Body1, Text, Subtitle2 } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: { padding: tokens.spacingVerticalM },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: tokens.colorNeutralForeground3 },
});

interface ActivityFeedProps {
  products: Product[];
}

export function ActivityFeed({ products }: ActivityFeedProps) {
  const styles = useStyles();
  const recent = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Card className={styles.card}>
      <Subtitle2>Recent Activity</Subtitle2>
      {recent.length === 0 ? (
        <Body1>No recent changes</Body1>
      ) : (
        <ul className={styles.list}>
          {recent.map((p) => (
            <li key={p.id} className={styles.item}>
              <Body1>{p.name} — qty {p.quantity}</Body1>
              <Text size={100} className={styles.time}>
                {new Date(p.updatedAt).toLocaleDateString()}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 6: Write `components/dashboard/LowStockPanel.tsx`**

```tsx
import { makeStyles, tokens, Card, Subtitle2, Body1, Text } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: { padding: tokens.spacingVerticalM, borderColor: tokens.colorStatusDangerBorder1 },
  title: { color: tokens.colorStatusDangerForeground1 },
  list: { listStyle: 'none', padding: 0, margin: `${tokens.spacingVerticalS} 0 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
});

interface LowStockPanelProps {
  alerts: Product[];
}

export function LowStockPanel({ alerts }: LowStockPanelProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <Subtitle2 className={styles.title}>⚠ Low Stock ({alerts.length})</Subtitle2>
      {alerts.length === 0 ? (
        <Body1>All stock levels healthy</Body1>
      ) : (
        <ul className={styles.list}>
          {alerts.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Body1>{p.name}</Body1>
              <Text size={100} style={{ color: tokens.colorStatusDangerForeground1 }}>
                {' '}— {p.quantity} left
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 7: Write `app/(app)/dashboard/page.tsx`**

```tsx
'use client';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { Header } from '../../../components/shell/Header';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { LowStockPanel } from '../../../components/dashboard/LowStockPanel';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useAlerts } from '../../../hooks/useAlerts';
import { useTeam } from '../../../hooks/useTeam';

const useStyles = makeStyles({
  content: { padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL },
  stats: { display: 'flex', gap: tokens.spacingHorizontalM, flexWrap: 'wrap' },
  bottom: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacingHorizontalM },
});

export default function DashboardPage() {
  const styles = useStyles();
  const { data: products, isLoading: pLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: alerts } = useAlerts();
  const { data: team } = useTeam();

  if (pLoading) return <Spinner label="Loading..." />;

  return (
    <>
      <Header title="Dashboard" />
      <div className={styles.content}>
        <div className={styles.stats}>
          <StatCard label="Total Items" value={products?.length ?? 0} />
          <StatCard label="Low Stock" value={alerts?.length ?? 0} accent={alerts?.length ? 'danger' : 'default'} />
          <StatCard label="Categories" value={categories?.length ?? 0} />
          <StatCard label="Team Members" value={team?.length ?? 0} />
        </div>
        <div className={styles.bottom}>
          <ActivityFeed products={products ?? []} />
          <LowStockPanel alerts={alerts ?? []} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/ app/\(app\)/dashboard/
git commit -m "feat(frontend): add dashboard page with StatCard, ActivityFeed, LowStockPanel"
```

---

## Task 8: Products Pages

**Files:**
- Create: `frontend/components/products/ProductsTable.tsx`
- Create: `frontend/components/products/ProductsTable.test.tsx`
- Create: `frontend/components/products/ProductForm.tsx`
- Create: `frontend/components/products/ProductForm.test.tsx`
- Create: `frontend/app/(app)/products/page.tsx`
- Create: `frontend/app/(app)/products/[id]/page.tsx`

- [ ] **Step 1: Write failing test for `ProductsTable`**

```tsx
// components/products/ProductsTable.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductsTable } from './ProductsTable';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  DataGrid: ({ children }: any) => <table>{children}</table>,
  DataGridBody: ({ children }: any) => <tbody>{children}</tbody>,
  DataGridCell: ({ children }: any) => <td>{children}</td>,
  DataGridHeader: ({ children }: any) => <thead>{children}</thead>,
  DataGridHeaderCell: ({ children }: any) => <th>{children}</th>,
  DataGridRow: ({ children }: any) => <tr>{children}</tr>,
  TableColumnDefinition: () => null,
  createTableColumn: (col: any) => col,
  Input: ({ onChange, value }: any) => <input onChange={onChange} value={value} />,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../products/StockBadge', () => ({
  StockBadge: ({ quantity }: any) => <span>{quantity}</span>,
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Delete20Regular: () => <svg />,
  Edit20Regular: () => <svg />,
}));

const products = [
  { id: 'p1', name: 'Widget', sku: 'WGT-001', quantity: 10, reorderThreshold: 5, category: { id: 'cat1', name: 'Electronics' }, unit: 'pcs', categoryId: 'cat1', createdAt: '', updatedAt: '' },
];

describe('ProductsTable', () => {
  it('renders product rows', () => {
    render(<ProductsTable products={products} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('WGT-001')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- ProductsTable
```

Expected: FAIL

- [ ] **Step 3: Write `components/products/ProductsTable.tsx`**

```tsx
'use client';
import {
  makeStyles,
  tokens,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableColumnDefinition,
  createTableColumn,
  Button,
} from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { StockBadge } from './StockBadge';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  table: { width: '100%' },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS },
});

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const styles = useStyles();

  const columns: TableColumnDefinition<Product>[] = [
    createTableColumn<Product>({ columnId: 'name', renderHeaderCell: () => 'Name', renderCell: (p) => p.name }),
    createTableColumn<Product>({ columnId: 'sku', renderHeaderCell: () => 'SKU', renderCell: (p) => p.sku }),
    createTableColumn<Product>({ columnId: 'category', renderHeaderCell: () => 'Category', renderCell: (p) => p.category.name }),
    createTableColumn<Product>({ columnId: 'quantity', renderHeaderCell: () => 'Stock', renderCell: (p) => <StockBadge quantity={p.quantity} threshold={p.reorderThreshold} /> }),
    createTableColumn<Product>({
      columnId: 'actions',
      renderHeaderCell: () => '',
      renderCell: (p) => (
        <div className={styles.actions}>
          <RoleGuard minRole="MANAGER">
            <Button icon={<Edit20Regular />} appearance="subtle" onClick={() => onEdit(p)} />
          </RoleGuard>
          <RoleGuard minRole="MANAGER">
            <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onDelete(p)} />
          </RoleGuard>
        </div>
      ),
    }),
  ];

  return (
    <DataGrid items={products} columns={columns} getRowId={(p) => p.id} className={styles.table}>
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<Product>>
        {({ item, rowId }) => (
          <DataGridRow<Product> key={rowId}>
            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- ProductsTable
```

Expected: PASS

- [ ] **Step 5: Write failing test for `ProductForm`**

```tsx
// components/products/ProductForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductForm } from './ProductForm';
import type { Category } from '../../hooks/useCategories';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Drawer: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerHeaderTitle: ({ children }: any) => <div>{children}</div>,
  DrawerBody: ({ children }: any) => <div>{children}</div>,
  Field: ({ children, label }: any) => <div><label>{label}</label>{children}</div>,
  Input: ({ value, onChange, name }: any) => <input name={name} value={value} onChange={onChange} />,
  Select: ({ value, onChange, children }: any) => <select value={value} onChange={onChange}>{children}</select>,
  Option: ({ children, value }: any) => <option value={value}>{children}</option>,
  Button: ({ children, onClick, type }: any) => <button onClick={onClick} type={type}>{children}</button>,
  Spinner: () => <span>Loading</span>,
}));

const categories: Category[] = [{ id: 'cat1', name: 'Electronics', createdAt: '', _count: { products: 0 } }];

describe('ProductForm', () => {
  it('renders form fields when open', () => {
    render(<ProductForm open categories={categories} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ProductForm open={false} categories={categories} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const onSubmit = vi.fn();
    render(<ProductForm open categories={categories} onSubmit={onSubmit} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Widget', name: 'name' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Run test — expect FAIL**

```bash
npm test -- ProductForm
```

Expected: FAIL

- [ ] **Step 7: Write `components/products/ProductForm.tsx`**

```tsx
'use client';
import { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Field,
  Input,
  Select,
  Option,
  Button,
  Spinner,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import type { Product } from '../../hooks/useProducts';
import type { Category } from '../../hooks/useCategories';

const useStyles = makeStyles({
  body: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, padding: tokens.spacingVerticalM },
  footer: { display: 'flex', gap: tokens.spacingHorizontalS, justifyContent: 'flex-end', padding: tokens.spacingVerticalM },
});

interface ProductFormProps {
  open: boolean;
  product?: Product;
  categories: Category[];
  onSubmit: (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY = { name: '', sku: '', quantity: 0, reorderThreshold: 10, unit: '', categoryId: '' };

export function ProductForm({ open, product, categories, onSubmit, onClose }: ProductFormProps) {
  const styles = useStyles();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? { name: product.name, sku: product.sku, quantity: product.quantity, reorderThreshold: product.reorderThreshold, unit: product.unit ?? '', categoryId: product.categoryId } : EMPTY);
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' || name === 'reorderThreshold' ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} position="end" size="medium">
      <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />}>
          {product ? 'Edit Product' : 'Add Product'}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.body}>
          <Field label="Name"><Input name="name" value={form.name} onChange={handleChange} /></Field>
          <Field label="SKU"><Input name="sku" value={form.sku} onChange={handleChange} /></Field>
          <Field label="Quantity"><Input name="quantity" type="number" value={String(form.quantity)} onChange={handleChange} /></Field>
          <Field label="Reorder Threshold"><Input name="reorderThreshold" type="number" value={String(form.reorderThreshold)} onChange={handleChange} /></Field>
          <Field label="Unit (optional)"><Input name="unit" value={form.unit} onChange={handleChange} placeholder="pcs, kg, boxes..." /></Field>
          <Field label="Category">
            <Select name="categoryId" value={form.categoryId} onChange={handleChange}>
              <Option value="">Select category...</Option>
              {categories.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Field>
        </div>
        <div className={styles.footer}>
          <Button appearance="secondary" onClick={onClose}>Cancel</Button>
          <Button appearance="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="tiny" /> : 'Save'}
          </Button>
        </div>
      </DrawerBody>
    </Drawer>
  );
}
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
npm test -- ProductForm
```

Expected: PASS

- [ ] **Step 9: Write `app/(app)/products/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Input, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { Header } from '../../../components/shell/Header';
import { ProductsTable } from '../../../components/products/ProductsTable';
import { ProductForm } from '../../../components/products/ProductForm';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { RoleGuard } from '../../../components/shared/RoleGuard';
import { useProducts, createProduct, updateProduct, deleteProduct, type Product } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { mutate } from 'swr';

const useStyles = makeStyles({
  content: { padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  toolbar: { display: 'flex', gap: tokens.spacingHorizontalM, alignItems: 'center' },
});

export default function ProductsPage() {
  const styles = useStyles();
  const { data: products, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Product | undefined>();
  const [opError, setOpError] = useState('');

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      mutate((key: string) => key.startsWith('/products'));
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      mutate((key: string) => key.startsWith('/products'));
      setDeleteTarget(undefined);
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  if (isLoading) return <Spinner label="Loading products..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load products</MessageBarBody></MessageBar>;

  return (
    <>
      <Header
        title="Products"
        actions={
          <RoleGuard minRole="MANAGER">
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
              Add Product
            </Button>
          </RoleGuard>
        }
      />
      <div className={styles.content}>
        {opError && <MessageBar intent="error" onDismiss={() => setOpError('')}><MessageBarBody>{opError}</MessageBarBody></MessageBar>}
        <div className={styles.toolbar}>
          <Input placeholder="Search by name or SKU..." value={search} onChange={(_, d) => setSearch(d.value)} style={{ maxWidth: 320 }} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No products found" description="Add your first product to get started." action={{ label: 'Add Product', onClick: () => setFormOpen(true) }} />
        ) : (
          <ProductsTable
            products={filtered}
            onEdit={(p) => { setEditing(p); setFormOpen(true); }}
            onDelete={setDeleteTarget}
          />
        )}
      </div>
      <ProductForm
        open={formOpen}
        product={editing}
        categories={categories ?? []}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />
      {deleteTarget && (
        <ConfirmDialog
          trigger={<span />}
          title="Delete Product"
          description={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
```

- [ ] **Step 10: Write `app/(app)/products/[id]/page.tsx`**

```tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Header } from '../../../../components/shell/Header';
import { ProductForm } from '../../../../components/products/ProductForm';
import { useProducts, updateProduct } from '../../../../hooks/useProducts';
import { useCategories } from '../../../../hooks/useCategories';
import { mutate } from 'swr';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

  const product = products?.find((p) => p.id === id);

  if (isLoading) return <Spinner label="Loading..." />;
  if (!product) return <MessageBar intent="error"><MessageBarBody>Product not found</MessageBarBody></MessageBar>;

  return (
    <>
      <Header title={product.name} />
      <ProductForm
        open
        product={product}
        categories={categories ?? []}
        onSubmit={async (data) => {
          await updateProduct(id, data);
          mutate((key: string) => key.startsWith('/products'));
          router.push('/products');
        }}
        onClose={() => router.push('/products')}
      />
    </>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add components/products/ app/\(app\)/products/
git commit -m "feat(frontend): add products list and detail pages"
```

---

## Task 9: Categories Page

**Files:**
- Create: `frontend/components/categories/CategoriesGrid.tsx`
- Create: `frontend/components/categories/CategoriesGrid.test.tsx`
- Create: `frontend/app/(app)/categories/page.tsx`

- [ ] **Step 1: Write failing test for `CategoriesGrid`**

```tsx
// components/categories/CategoriesGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoriesGrid } from './CategoriesGrid';
import type { Category } from '../../hooks/useCategories';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ header }: any) => <div>{header}</div>,
  Body1: ({ children }: any) => <span>{children}</span>,
  Subtitle2: ({ children }: any) => <span>{children}</span>,
  Text: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ role: 'ADMIN', user: null, isLoading: false })),
}));

const categories: Category[] = [
  { id: 'cat1', name: 'Electronics', createdAt: '', _count: { products: 5 } },
];

describe('CategoriesGrid', () => {
  it('renders category cards', () => {
    render(<CategoriesGrid categories={categories} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('5 products')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- CategoriesGrid
```

Expected: FAIL

- [ ] **Step 3: Write `components/categories/CategoriesGrid.tsx`**

```tsx
'use client';
import { makeStyles, tokens, Card, Body1, Subtitle2, Text, Button } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { Category } from '../../hooks/useCategories';

const useStyles = makeStyles({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacingHorizontalM },
  card: { padding: tokens.spacingVerticalM },
  count: { color: tokens.colorNeutralForeground3 },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS, marginTop: tokens.spacingVerticalS },
});

interface CategoriesGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesGrid({ categories, onEdit, onDelete }: CategoriesGridProps) {
  const styles = useStyles();
  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <Card key={cat.id} className={styles.card}>
          <Subtitle2>{cat.name}</Subtitle2>
          <Text size={200} className={styles.count}>{cat._count.products} products</Text>
          <RoleGuard minRole="MANAGER">
            <div className={styles.actions}>
              <Button icon={<Edit20Regular />} appearance="subtle" size="small" onClick={() => onEdit(cat)} />
              <RoleGuard minRole="ADMIN">
                <Button icon={<Delete20Regular />} appearance="subtle" size="small" onClick={() => onDelete(cat)} />
              </RoleGuard>
            </div>
          </RoleGuard>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- CategoriesGrid
```

Expected: PASS

- [ ] **Step 5: Write `app/(app)/categories/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Spinner, MessageBar, MessageBarBody, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Input, Field } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { Header } from '../../../components/shell/Header';
import { CategoriesGrid } from '../../../components/categories/CategoriesGrid';
import { EmptyState } from '../../../components/shared/EmptyState';
import { RoleGuard } from '../../../components/shared/RoleGuard';
import { useCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../../hooks/useCategories';
import { mutate } from 'swr';

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [name, setName] = useState('');
  const [opError, setOpError] = useState('');

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }
      mutate('/categories');
      setDialogOpen(false);
      setName('');
      setEditing(undefined);
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      mutate('/categories');
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  if (isLoading) return <Spinner label="Loading categories..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load categories</MessageBarBody></MessageBar>;

  return (
    <>
      <Header
        title="Categories"
        actions={
          <RoleGuard minRole="MANAGER">
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setName(''); setDialogOpen(true); }}>
              Add Category
            </Button>
          </RoleGuard>
        }
      />
      <div style={{ padding: tokens.spacingVerticalL }}>
        {opError && <MessageBar intent="error" onDismiss={() => setOpError('')}><MessageBarBody>{opError}</MessageBarBody></MessageBar>}
        {(categories ?? []).length === 0 ? (
          <EmptyState title="No categories yet" description="Organise your products by adding categories." action={{ label: 'Add Category', onClick: () => setDialogOpen(true) }} />
        ) : (
          <CategoriesGrid
            categories={categories ?? []}
            onEdit={(cat) => { setEditing(cat); setName(cat.name); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogContent>
              <Field label="Name"><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={handleSave}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/categories/ app/\(app\)/categories/
git commit -m "feat(frontend): add categories page"
```

---

## Task 10: Alerts Page

**Files:**
- Create: `frontend/components/alerts/AlertsTable.tsx`
- Create: `frontend/components/alerts/AlertsTable.test.tsx`
- Create: `frontend/app/(app)/alerts/page.tsx`

- [ ] **Step 1: Write failing test for `AlertsTable`**

```tsx
// components/alerts/AlertsTable.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertsTable } from './AlertsTable';
import type { Product } from '../../hooks/useProducts';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableHeaderCell: ({ children }: any) => <th>{children}</th>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ role: 'MANAGER', user: null, isLoading: false })),
}));

const alerts: Product[] = [
  { id: 'p1', name: 'Widget', sku: 'WGT-001', quantity: 2, reorderThreshold: 10, categoryId: 'cat1', category: { id: 'cat1', name: 'Electronics' }, createdAt: '', updatedAt: '' },
];

describe('AlertsTable', () => {
  it('renders alert rows', () => {
    render(<AlertsTable alerts={alerts} onUpdateThreshold={vi.fn()} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- AlertsTable
```

Expected: FAIL

- [ ] **Step 3: Write `components/alerts/AlertsTable.tsx`**

```tsx
'use client';
import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Input,
} from '@fluentui/react-components';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  table: { width: '100%' },
  editing: { display: 'flex', gap: tokens.spacingHorizontalXS, alignItems: 'center' },
});

interface AlertsTableProps {
  alerts: Product[];
  onUpdateThreshold: (productId: string, threshold: number) => Promise<void>;
}

function ThresholdCell({ product, onUpdate }: { product: Product; onUpdate: (id: string, t: number) => Promise<void> }) {
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.reorderThreshold));

  const save = async () => {
    await onUpdate(product.id, Number(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={styles.editing}>
        <Input type="number" value={value} onChange={(_, d) => setValue(d.value)} style={{ width: 70 }} />
        <Button size="small" appearance="primary" onClick={save}>Save</Button>
        <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <RoleGuard minRole="MANAGER" fallback={<span>{product.reorderThreshold}</span>}>
      <Button appearance="subtle" size="small" onClick={() => setEditing(true)}>{product.reorderThreshold}</Button>
    </RoleGuard>
  );
}

export function AlertsTable({ alerts, onUpdateThreshold }: AlertsTableProps) {
  const styles = useStyles();
  return (
    <Table className={styles.table}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>SKU</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Threshold</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.sku}</TableCell>
            <TableCell>{p.category.name}</TableCell>
            <TableCell><Badge color="danger" appearance="filled">{p.quantity}</Badge></TableCell>
            <TableCell><ThresholdCell product={p} onUpdate={onUpdateThreshold} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- AlertsTable
```

Expected: PASS

- [ ] **Step 5: Write `app/(app)/alerts/page.tsx`**

```tsx
'use client';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Header } from '../../../components/shell/Header';
import { AlertsTable } from '../../../components/alerts/AlertsTable';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useAlerts, updateThreshold } from '../../../hooks/useAlerts';
import { mutate } from 'swr';

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();

  const handleUpdateThreshold = async (productId: string, threshold: number) => {
    await updateThreshold(productId, threshold);
    mutate('/alerts');
  };

  if (isLoading) return <Spinner label="Loading alerts..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load alerts</MessageBarBody></MessageBar>;

  return (
    <>
      <Header title="Reorder Alerts" />
      <div style={{ padding: tokens.spacingVerticalL }}>
        {(alerts ?? []).length === 0 ? (
          <EmptyState title="No reorder alerts" description="All stock levels are above their thresholds." />
        ) : (
          <AlertsTable alerts={alerts ?? []} onUpdateThreshold={handleUpdateThreshold} />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/alerts/ app/\(app\)/alerts/
git commit -m "feat(frontend): add alerts page"
```

---

## Task 11: Team Page

**Files:**
- Create: `frontend/components/team/TeamTable.tsx`
- Create: `frontend/components/team/TeamTable.test.tsx`
- Create: `frontend/app/(app)/team/page.tsx`

- [ ] **Step 1: Write failing test for `TeamTable`**

```tsx
// components/team/TeamTable.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamTable } from './TeamTable';
import type { TeamMember } from '../../hooks/useTeam';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableHeaderCell: ({ children }: any) => <th>{children}</th>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Avatar: ({ name }: any) => <span>{name}</span>,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ role: 'ADMIN', user: null, isLoading: false })),
}));

const members: TeamMember[] = [
  { id: 'u1', auth0Id: 'auth0|abc', email: 'alice@co.com', name: 'Alice', role: 'ADMIN', createdAt: '', updatedAt: '' },
  { id: 'u2', auth0Id: 'auth0|def', email: 'bob@co.com', name: 'Bob', role: 'STAFF', createdAt: '', updatedAt: '' },
];

describe('TeamTable', () => {
  it('renders team member rows', () => {
    render(<TeamTable members={members} onUpdateRole={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@co.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- TeamTable
```

Expected: FAIL

- [ ] **Step 3: Write `components/team/TeamTable.tsx`**

```tsx
'use client';
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Avatar,
  Select,
  Option,
} from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { TeamMember, Role } from '../../hooks/useTeam';

const ROLE_COLORS: Record<Role, 'brand' | 'warning' | 'informative'> = {
  ADMIN: 'brand',
  MANAGER: 'warning',
  STAFF: 'informative',
};

const useStyles = makeStyles({ table: { width: '100%' } });

interface TeamTableProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

export function TeamTable({ members, onUpdateRole, onRemove }: TeamTableProps) {
  const styles = useStyles();
  return (
    <Table className={styles.table}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <Avatar name={m.name} />
              {' '}{m.name}
            </TableCell>
            <TableCell>{m.email}</TableCell>
            <TableCell>
              <RoleGuard minRole="ADMIN" fallback={<Badge color={ROLE_COLORS[m.role]}>{m.role}</Badge>}>
                <Select value={m.role} onChange={(_, d) => onUpdateRole(m.id, d.value as Role)} style={{ width: 120 }}>
                  <Option value="STAFF">STAFF</Option>
                  <Option value="MANAGER">MANAGER</Option>
                  <Option value="ADMIN">ADMIN</Option>
                </Select>
              </RoleGuard>
            </TableCell>
            <TableCell>
              <RoleGuard minRole="ADMIN">
                <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onRemove(m)} />
              </RoleGuard>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- TeamTable
```

Expected: PASS

- [ ] **Step 5: Write `app/(app)/team/page.tsx`**

```tsx
'use client';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { redirect } from 'next/navigation';
import { Header } from '../../../components/shell/Header';
import { TeamTable } from '../../../components/team/TeamTable';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useTeam, updateMember, deleteMember, type Role } from '../../../hooks/useTeam';
import { useAuth } from '../../../contexts/AuthContext';
import { mutate } from 'swr';

export default function TeamPage() {
  const { role } = useAuth();
  const { data: members, isLoading, error } = useTeam();

  if (role === 'STAFF') redirect('/dashboard');

  const handleUpdateRole = async (id: string, newRole: Role) => {
    await updateMember(id, { role: newRole });
    mutate('/users');
  };

  const handleRemove = async (member: { id: string }) => {
    await deleteMember(member.id);
    mutate('/users');
  };

  if (isLoading) return <Spinner label="Loading team..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load team</MessageBarBody></MessageBar>;

  return (
    <>
      <Header title="Team" />
      <div style={{ padding: tokens.spacingVerticalL }}>
        {(members ?? []).length === 0 ? (
          <EmptyState title="No team members" description="Invite people to join your team." />
        ) : (
          <TeamTable
            members={members ?? []}
            onUpdateRole={handleUpdateRole}
            onRemove={handleRemove}
          />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/team/ app/\(app\)/team/
git commit -m "feat(frontend): add team page"
```

---

## Task 12: Run Full Test Suite

- [ ] **Step 1: Run all frontend tests**

```bash
cd frontend && npm test
```

Expected: All tests PASS. If any fail, fix the issue before proceeding.

- [ ] **Step 2: Start the full stack**

```bash
cd .. && npm run dev
```

Expected: Frontend starts at `http://localhost:3000`, backend at `http://localhost:3001`. Visiting `http://localhost:3000` redirects to Auth0 login. After login, dashboard loads with sidebar.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat(frontend): complete frontend implementation"
```
