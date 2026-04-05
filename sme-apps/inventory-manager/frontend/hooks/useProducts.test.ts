import { renderHook } from '@testing-library/react';
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
    renderHook(() => useProducts());
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
