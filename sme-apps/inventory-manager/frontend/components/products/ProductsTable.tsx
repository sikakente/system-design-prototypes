'use client';
import { makeStyles, mergeClasses, Button } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { StockBadge } from './StockBadge';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  wrapper: {
    borderRadius: '12px',
    border: '1px solid var(--p-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--p-card)',
    boxShadow: 'var(--p-shadow)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--p-sans)',
  },
  th: {
    padding: '12px 20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--p-text-3)',
    borderBottom: '1px solid var(--p-border)',
    backgroundColor: '#F8FAFC',
    textAlign: 'left',
  },
  td: {
    padding: '14px 20px',
    fontSize: '13px',
    color: 'var(--p-text)',
    borderBottom: '1px solid var(--p-border)',
    fontFamily: 'var(--p-sans)',
  },
  tdLast: {
    borderBottom: 'none',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
});

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>SKU</th>
            <th className={styles.th}>Category</th>
            <th className={styles.th}>Stock</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const isLast = index === products.length - 1;
            const tdClass = isLast ? mergeClasses(styles.td, styles.tdLast) : styles.td;
            return (
              <tr key={product.id}>
                <td className={tdClass}>{product.name}</td>
                <td className={tdClass}>{product.sku}</td>
                <td className={tdClass}>{product.category.name}</td>
                <td className={tdClass}>
                  <StockBadge quantity={product.quantity} threshold={product.reorderThreshold} />
                </td>
                <td className={tdClass}>
                  <div className={styles.actions}>
                    <RoleGuard minRole="STAFF">
                      <Button icon={<Edit20Regular />} appearance="subtle" onClick={() => onEdit(product)} />
                    </RoleGuard>
                    <RoleGuard minRole="MANAGER">
                      <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onDelete(product)} />
                    </RoleGuard>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
