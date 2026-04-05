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
