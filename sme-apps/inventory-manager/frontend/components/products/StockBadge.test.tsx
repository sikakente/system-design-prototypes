import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StockBadge } from './StockBadge';

vi.mock('@fluentui/react-components', () => ({
  Badge: ({ children, color }: any) => <span data-color={color}>{children}</span>,
}));

describe('StockBadge', () => {
  it('shows danger color when quantity is 0', () => {
    render(<StockBadge quantity={0} threshold={10} />);
    const badge = screen.getByText('0').closest('[data-color]');
    expect(badge?.getAttribute('data-color')).toBe('danger');
  });

  it('shows warning color when quantity is at or below threshold', () => {
    render(<StockBadge quantity={5} threshold={10} />);
    const badge = screen.getByText('5').closest('[data-color]');
    expect(badge?.getAttribute('data-color')).toBe('warning');
  });

  it('shows success color when quantity is above threshold', () => {
    render(<StockBadge quantity={20} threshold={10} />);
    const badge = screen.getByText('20').closest('[data-color]');
    expect(badge?.getAttribute('data-color')).toBe('success');
  });
});
