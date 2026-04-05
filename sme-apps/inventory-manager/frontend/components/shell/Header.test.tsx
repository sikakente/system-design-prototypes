import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
  Title3: ({ children }: any) => <h3>{children}</h3>,
}));

describe('Header', () => {
  it('renders title', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<Header title="Products" actions={<button>Add</button>} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
