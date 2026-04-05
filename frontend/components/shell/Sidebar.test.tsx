import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import * as AuthContextModule from '../../contexts/AuthContext';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children, minRole }: any) =>
    minRole === 'MANAGER' ? null : children,
}));

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Text: ({ children }: any) => <span>{children}</span>,
  Body1: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Home20Regular: () => <svg />,
  Box20Regular: () => <svg />,
  Tag20Regular: () => <svg />,
  Alert20Regular: () => <svg />,
  People20Regular: () => <svg />,
}));

describe('Sidebar', () => {
  it('renders nav links', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice' } as any,
      role: 'ADMIN',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Reorder Alerts')).toBeInTheDocument();
  });

  it('shows user name in footer', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice' } as any,
      role: 'STAFF',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
