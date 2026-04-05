import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell';

vi.mock('./Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}));

vi.mock('@fluentui/react-components', () => ({
  makeStyles: () => () => ({}),
  tokens: {},
}));

describe('AppShell', () => {
  it('renders sidebar and children', () => {
    render(<AppShell><p>page content</p></AppShell>);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
