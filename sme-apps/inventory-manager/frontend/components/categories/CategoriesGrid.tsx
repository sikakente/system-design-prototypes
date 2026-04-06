'use client';
import { Button } from '@fluentui/react-components';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { Category } from '../../hooks/useCategories';

interface CategoriesGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesGrid({ categories, onEdit, onDelete }: CategoriesGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '14px',
      }}
    >
      {categories.map((cat) => (
        <div
          key={cat.id}
          style={{
            backgroundColor: 'var(--p-card)',
            border: '1px solid var(--p-border)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--p-shadow)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--p-sans)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--p-text)',
              margin: 0,
            }}
          >
            {cat.name}
          </h3>
          <p
            style={{
              fontFamily: 'var(--p-sans)',
              fontSize: '12px',
              color: 'var(--p-text-2)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            {cat._count.products} products
          </p>
          <RoleGuard minRole="MANAGER">
            <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
              <Button icon={<Edit20Regular />} appearance="subtle" size="small" onClick={() => onEdit(cat)} />
              <RoleGuard minRole="ADMIN">
                <Button icon={<Delete20Regular />} appearance="subtle" size="small" onClick={() => onDelete(cat)} />
              </RoleGuard>
            </div>
          </RoleGuard>
        </div>
      ))}
    </div>
  );
}
