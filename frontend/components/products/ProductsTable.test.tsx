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

vi.mock('./StockBadge', () => ({
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
