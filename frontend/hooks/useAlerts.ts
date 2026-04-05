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
