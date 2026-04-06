'use client';
import { Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { StockBadge } from './StockBadge';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const columns: ColumnsType<Product> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Category', key: 'category', render: (_, p) => p.category.name },
    { title: 'Stock', key: 'stock', render: (_, p) => <StockBadge quantity={p.quantity} threshold={p.reorderThreshold} /> },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, p) => (
        <Space>
          <RoleGuard minRole="STAFF">
            <Button type="text" icon={<Edit20Regular />} onClick={() => onEdit(p)} />
          </RoleGuard>
          <RoleGuard minRole="MANAGER">
            <Button type="text" icon={<Delete20Regular />} onClick={() => onDelete(p)} danger />
          </RoleGuard>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={products} rowKey="id" pagination={false} />;
}
