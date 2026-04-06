'use client';
import { useState } from 'react';
import { Button, Input } from '@fluentui/react-components';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

interface AlertsTableProps {
  alerts: Product[];
  onUpdateThreshold: (productId: string, threshold: number) => Promise<void>;
}

function ThresholdCell({ product, onUpdate }: { product: Product; onUpdate: (id: string, t: number) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.reorderThreshold));

  const save = async () => {
    await onUpdate(product.id, Number(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Input type="number" value={value} onChange={(_, d) => setValue(d.value)} style={{ width: 70 }} />
        <Button size="small" appearance="primary" onClick={save}>Save</Button>
        <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <RoleGuard minRole="MANAGER" fallback={<span style={{ color: 'var(--p-text)', fontFamily: 'var(--p-sans)' }}>{product.reorderThreshold}</span>}>
      <Button appearance="subtle" size="small" onClick={() => setEditing(true)}>{product.reorderThreshold}</Button>
    </RoleGuard>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--p-text-3)',
  borderBottom: '1px solid var(--p-border)',
  backgroundColor: '#F8FAFC',
  textAlign: 'left' as const,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '13px',
  color: 'var(--p-text)',
  borderBottom: '1px solid var(--p-border)',
};

const tdLastStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '13px',
  color: 'var(--p-text)',
};

export function AlertsTable({ alerts, onUpdateThreshold }: AlertsTableProps) {
  return (
    <div style={{ backgroundColor: 'var(--p-card)', border: '1px solid var(--p-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--p-shadow)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-sans)' }}>
        <thead>
          <tr>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Threshold</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((p, index) => {
            const isLast = index === alerts.length - 1;
            const cellStyle = isLast ? tdLastStyle : tdStyle;
            return (
              <tr key={p.id}>
                <td style={cellStyle}>{p.name}</td>
                <td style={cellStyle}>{p.sku}</td>
                <td style={cellStyle}>{p.category.name}</td>
                <td style={cellStyle}>
                  <span style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--p-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                    {p.quantity}
                  </span>
                </td>
                <td style={cellStyle}>
                  <ThresholdCell product={p} onUpdate={onUpdateThreshold} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
