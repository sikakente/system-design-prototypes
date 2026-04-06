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
  Body1Strong: ({ children }: any) => <span>{children}</span>,
  Caption1: ({ children }: any) => <span>{children}</span>,
  Avatar: ({ name, 'aria-label': ariaLabel }: any) => (
    <button aria-label={ariaLabel ?? name}></button>
  ),
  Menu: ({ children }: any) => <div>{children}</div>,
  MenuTrigger: ({ children }: any) => <div>{children}</div>,
  MenuPopover: ({ children }: any) => <div>{children}</div>,
  MenuList: ({ children }: any) => <div>{children}</div>,
  MenuGroup: ({ children }: any) => <div>{children}</div>,
  MenuGroupHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  MenuDivider: () => <hr />,
  MenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" onClick={onClick}>{children}</div>
  ),
}));

vi.mock('@fluentui/react-icons', () => ({
  Home20Regular: () => <svg />,
  Box20Regular: () => <svg />,
  Tag20Regular: () => <svg />,
  Alert20Regular: () => <svg />,
  People20Regular: () => <svg />,
  SignOut20Regular: () => <svg />,
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

  it('renders avatar with user initials accessible label', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice Smith' } as any,
      role: 'STAFF',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: 'Alice Smith' })).toBeInTheDocument();
  });

  it('shows user name and role in the dropdown header', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice Smith' } as any,
      role: 'MANAGER',
      isLoading: false,
    });
    render(<Sidebar />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('MANAGER')).toBeInTheDocument();
  });

  it('renders a sign out menu item with a link to /auth/logout', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice Smith' } as any,
      role: 'STAFF',
      isLoading: false,
    });
    render(<Sidebar />);
    const link = screen.getByRole('link', { name: /sign out/i });
    expect(link).toHaveAttribute('href', '/auth/logout');
  });

  it('falls back to "User" when user is undefined', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: undefined,
      role: 'STAFF',
      isLoading: true,
    });
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: 'User' })).toBeInTheDocument();
  });
});
