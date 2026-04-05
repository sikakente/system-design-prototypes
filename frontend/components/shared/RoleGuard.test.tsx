import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleGuard } from './RoleGuard';
import * as AuthContextModule from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('RoleGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders children when user role meets minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'ADMIN',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>secret</span></RoleGuard>);
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('renders nothing when role is below minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'STAFF',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>secret</span></RoleGuard>);
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders fallback when role is below minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'STAFF',
      isLoading: false,
    });
    render(
      <RoleGuard minRole="MANAGER" fallback={<span>no access</span>}>
        <span>secret</span>
      </RoleGuard>,
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('no access')).toBeInTheDocument();
  });

  it('renders children when role exactly meets minimum', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      role: 'MANAGER',
      isLoading: false,
    });
    render(<RoleGuard minRole="MANAGER"><span>allowed</span></RoleGuard>);
    expect(screen.getByText('allowed')).toBeInTheDocument();
  });
});
