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
