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
