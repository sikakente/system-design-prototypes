'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Input } from '@fluentui/react-components';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'hidden',
    boxShadow: tokens.shadow4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: tokens.fontFamilyBase,
  },
  th: {
    padding: '12px 20px',
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: tokens.colorNeutralForeground3,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    backgroundColor: tokens.colorNeutralBackground3,
    textAlign: 'left',
  },
  td: {
    padding: '14px 20px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
  },
  tdLast: {
    padding: '14px 20px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  stockBadge: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground2,
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: tokens.fontWeightSemibold,
  },
  thresholdFallback: {
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
  },
  editRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
});

interface AlertsTableProps {
  alerts: Product[];
  onUpdateThreshold: (productId: string, threshold: number) => Promise<void>;
}

function ThresholdCell({ product, onUpdate }: { product: Product; onUpdate: (id: string, t: number) => Promise<void> }) {
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.reorderThreshold));

  const save = async () => {
    await onUpdate(product.id, Number(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={styles.editRow}>
        <Input type="number" value={value} onChange={(_, d) => setValue(d.value)} style={{ width: 70 }} />
        <Button size="small" appearance="primary" onClick={save}>Save</Button>
        <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <RoleGuard minRole="MANAGER" fallback={<span className={styles.thresholdFallback}>{product.reorderThreshold}</span>}>
      <Button appearance="subtle" size="small" onClick={() => setEditing(true)}>{product.reorderThreshold}</Button>
    </RoleGuard>
  );
}

export function AlertsTable({ alerts, onUpdateThreshold }: AlertsTableProps) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Product</th>
            <th className={styles.th}>SKU</th>
            <th className={styles.th}>Category</th>
            <th className={styles.th}>Stock</th>
            <th className={styles.th}>Threshold</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((p, index) => {
            const isLast = index === alerts.length - 1;
            const cellClass = isLast ? styles.tdLast : styles.td;
            return (
              <tr key={p.id}>
                <td className={cellClass}>{p.name}</td>
                <td className={cellClass}>{p.sku}</td>
                <td className={cellClass}>{p.category.name}</td>
                <td className={cellClass}>
                  <span className={styles.stockBadge}>{p.quantity}</span>
                </td>
                <td className={cellClass}>
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
