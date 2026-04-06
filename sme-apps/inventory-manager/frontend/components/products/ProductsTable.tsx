'use client';
import { makeStyles, mergeClasses, Button, tokens } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { StockBadge } from './StockBadge';
import { RoleGuard } from '../shared/RoleGuard';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  wrapper: {
    borderRadius: tokens.borderRadiusLarge,
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
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: tokens.fontFamilyBase,
  },
  th: {
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    fontSize: tokens.fontSizeBase200,
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
    paddingTop: '14px',
    paddingBottom: '14px',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    fontFamily: tokens.fontFamilyBase,
  },
  tdLast: {
    borderBottomWidth: '0',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
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
