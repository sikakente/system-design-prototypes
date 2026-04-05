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
  Input: ({ value, onChange }: any) => <input value={value} onChange={onChange} />,
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children }: any) => <>{children}</>,
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
