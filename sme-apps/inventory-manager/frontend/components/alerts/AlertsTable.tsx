'use client';
import { useState } from 'react';
import { Table, Tag, Button, Input, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
      <Space>
        <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: 70 }} size="small" />
        <Button size="small" type="primary" onClick={save}>Save</Button>
        <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
      </Space>
    );
  }

  return (
    <RoleGuard minRole="MANAGER" fallback={<span>{product.reorderThreshold}</span>}>
      <Button type="text" size="small" onClick={() => setEditing(true)}>{product.reorderThreshold}</Button>
    </RoleGuard>
  );
}

export function AlertsTable({ alerts, onUpdateThreshold }: AlertsTableProps) {
  const columns: ColumnsType<Product> = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    {
      title: 'Category',
      key: 'category',
      render: (_, p) => p.category.name,
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, p) => {
        const color = p.quantity === 0 ? 'error' : p.quantity <= p.reorderThreshold ? 'warning' : 'success';
        return <Tag color={color}>{p.quantity}</Tag>;
      },
    },
    {
      title: 'Threshold',
      key: 'threshold',
      render: (_, p) => <ThresholdCell product={p} onUpdate={onUpdateThreshold} />,
    },
  ];

  return <Table columns={columns} dataSource={alerts} rowKey="id" pagination={false} />;
}
