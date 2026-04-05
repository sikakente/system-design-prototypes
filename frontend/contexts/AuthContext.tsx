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
