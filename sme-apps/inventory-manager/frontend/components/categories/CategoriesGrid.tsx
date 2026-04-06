'use client';
import { makeStyles, tokens, Button, Text, Card } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { Category } from '../../hooks/useCategories';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  },
  cardName: {
    fontSize: '15px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    display: 'block',
  },
  cardCount: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    fontFamily: tokens.fontFamilyBase,
    marginTop: '4px',
    display: 'block',
  },
  cardActions: {
    display: 'flex',
    gap: '4px',
    marginTop: '12px',
  },
  card: {
    borderRadius: tokens.borderRadiusLarge,
    padding: '20px',
    boxShadow: tokens.shadow4,
  },
});

interface CategoriesGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesGrid({ categories, onEdit, onDelete }: CategoriesGridProps) {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <Card key={cat.id} className={styles.card}>
          <Text className={styles.cardName}>{cat.name}</Text>
          <Text className={styles.cardCount}>{cat._count.products} products</Text>
          <RoleGuard minRole="MANAGER">
            <div className={styles.cardActions}>
              <Button icon={<Edit20Regular />} appearance="subtle" size="small" onClick={() => onEdit(cat)} />
              <RoleGuard minRole="ADMIN">
                <Button icon={<Delete20Regular />} appearance="subtle" size="small" onClick={() => onDelete(cat)} />
              </RoleGuard>
            </div>
          </RoleGuard>
        </Card>
      ))}
    </div>
  );
}
