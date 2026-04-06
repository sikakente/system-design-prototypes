import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatCard } from './StatCard';

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  mergeClasses: (...c: (string | undefined)[]) => c.filter(Boolean).join(' '),
  tokens: {},
  Card: ({ children }: any) => <div>{children}</div>,
  Body1: ({ children }: any) => <span>{children}</span>,
  Title2: ({ children }: any) => <span>{children}</span>,
  Text: ({ children }: any) => <span>{children}</span>,
}));

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Items" value={248} icon={<span>icon</span>} />);
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument();
  });
});
