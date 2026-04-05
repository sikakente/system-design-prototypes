'use client';
import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Input,
} from '@fluentui/react-components';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  table: { width: '100%' },
  editing: { display: 'flex', gap: tokens.spacingHorizontalXS, alignItems: 'center' },
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
      <div className={styles.editing}>
        <Input type="number" value={value} onChange={(_, d) => setValue(d.value)} style={{ width: 70 }} />
        <Button size="small" appearance="primary" onClick={save}>Save</Button>
        <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <RoleGuard minRole="MANAGER" fallback={<span>{product.reorderThreshold}</span>}>
      <Button appearance="subtle" size="small" onClick={() => setEditing(true)}>{product.reorderThreshold}</Button>
    </RoleGuard>
  );
}

export function AlertsTable({ alerts, onUpdateThreshold }: AlertsTableProps) {
  const styles = useStyles();
  return (
    <Table className={styles.table}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>SKU</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Threshold</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.sku}</TableCell>
            <TableCell>{p.category.name}</TableCell>
            <TableCell><Badge color="danger" appearance="filled">{p.quantity}</Badge></TableCell>
            <TableCell><ThresholdCell product={p} onUpdate={onUpdateThreshold} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
