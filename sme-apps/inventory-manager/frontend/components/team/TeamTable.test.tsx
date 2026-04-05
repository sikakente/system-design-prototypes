import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamTable } from './TeamTable';
import type { TeamMember } from '../../hooks/useTeam';

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
  Avatar: ({ name }: any) => <span>{name}</span>,
  Select: ({ value, onChange, children }: any) => <select value={value} onChange={onChange}>{children}</select>,
  Option: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock('../shared/RoleGuard', () => ({
  RoleGuard: ({ children, fallback }: any) => <>{children ?? fallback}</>,
}));

vi.mock('@fluentui/react-icons', () => ({
  Delete20Regular: () => <svg />,
}));

const members: TeamMember[] = [
  { id: 'u1', auth0Id: 'auth0|abc', email: 'alice@co.com', name: 'Alice', role: 'ADMIN', createdAt: '', updatedAt: '' },
  { id: 'u2', auth0Id: 'auth0|def', email: 'bob@co.com', name: 'Bob', role: 'STAFF', createdAt: '', updatedAt: '' },
];

describe('TeamTable', () => {
  it('renders team member rows', () => {
    render(<TeamTable members={members} onUpdateRole={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@co.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
