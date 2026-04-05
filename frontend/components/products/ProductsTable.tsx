'use client';
import {
  makeStyles,
  tokens,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  createTableColumn,
  Button,
} from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { StockBadge } from './StockBadge';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  table: { width: '100%' },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS },
});

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const styles = useStyles();

  const columns: TableColumnDefinition<Product>[] = [
    createTableColumn<Product>({ columnId: 'name', renderHeaderCell: () => 'Name', renderCell: (p) => p.name }),
    createTableColumn<Product>({ columnId: 'sku', renderHeaderCell: () => 'SKU', renderCell: (p) => p.sku }),
    createTableColumn<Product>({ columnId: 'category', renderHeaderCell: () => 'Category', renderCell: (p) => p.category.name }),
    createTableColumn<Product>({
      columnId: 'quantity',
      renderHeaderCell: () => 'Stock',
      renderCell: (p) => <StockBadge quantity={p.quantity} threshold={p.reorderThreshold} />,
    }),
    createTableColumn<Product>({
      columnId: 'actions',
      renderHeaderCell: () => '',
      renderCell: (p) => (
        <div className={styles.actions}>
          <RoleGuard minRole="MANAGER">
            <Button icon={<Edit20Regular />} appearance="subtle" onClick={() => onEdit(p)} />
          </RoleGuard>
          <RoleGuard minRole="MANAGER">
            <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onDelete(p)} />
          </RoleGuard>
        </div>
      ),
    }),
  ];

  return (
    <DataGrid items={products} columns={columns} getRowId={(p) => p.id} className={styles.table}>
      <DataGridHeader>
        <DataGridRow>
          {columns.map((col) => (
            <DataGridHeaderCell key={col.columnId}>{col.renderHeaderCell()}</DataGridHeaderCell>
          ))}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<Product>>
        {products.map((item) => (
          <DataGridRow<Product> key={item.id}>
            {columns.map((col) => (
              <DataGridCell key={col.columnId}>{col.renderCell(item)}</DataGridCell>
            ))}
          </DataGridRow>
        ))}
      </DataGridBody>
    </DataGrid>
  );
}
