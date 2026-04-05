import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoriesGrid } from './CategoriesGrid';
import type { Category } from '../../hooks/useCategories';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Card: ({ children }: any) => <div>{children}</div>,
  Body1: ({ children }: any) => <span>{children}</span>,
  Subtitle2: ({ children }: any) => <span>{children}</span>,
  Text: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Delete20Regular: () => <svg />,
  Edit20Regular: () => <svg />,
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
