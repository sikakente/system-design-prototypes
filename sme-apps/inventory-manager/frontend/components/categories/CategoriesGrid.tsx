'use client';
import { makeStyles, tokens, Card, Body1, Subtitle2, Text, Button } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { Category } from '../../hooks/useCategories';

const useStyles = makeStyles({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacingHorizontalM },
  card: { padding: tokens.spacingVerticalM },
  count: { color: tokens.colorNeutralForeground3 },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS, marginTop: tokens.spacingVerticalS },
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
          <Subtitle2>{cat.name}</Subtitle2>
          <Text size={200} className={styles.count}>{cat._count.products} products</Text>
          <RoleGuard minRole="MANAGER">
            <div className={styles.actions}>
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
