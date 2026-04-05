import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductForm } from './ProductForm';
import type { Category } from '../../hooks/useCategories';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Drawer: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerHeaderTitle: ({ children, action }: any) => <div>{action}{children}</div>,
  DrawerBody: ({ children }: any) => <div>{children}</div>,
  Field: ({ children, label }: any) => <div><label>{label}</label>{children}</div>,
  Input: ({ value, onChange, name }: any) => <input name={name} value={value} onChange={onChange} />,
  Select: ({ value, onChange, children }: any) => <select value={value} onChange={onChange}>{children}</select>,
  Option: ({ children, value }: any) => <option value={value}>{children}</option>,
  Button: ({ children, onClick, type }: any) => <button onClick={onClick} type={type}>{children}</button>,
  Spinner: () => <span>Loading</span>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Dismiss24Regular: () => <svg />,
}));

const categories: Category[] = [{ id: 'cat1', name: 'Electronics', createdAt: '', _count: { products: 0 } }];

describe('ProductForm', () => {
  it('renders form fields when open', () => {
    render(<ProductForm open categories={categories} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ProductForm open={false} categories={categories} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm open categories={categories} onSubmit={onSubmit} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Widget', name: 'name' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
