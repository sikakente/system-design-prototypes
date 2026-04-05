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
