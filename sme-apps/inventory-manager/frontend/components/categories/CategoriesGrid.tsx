'use client';
import { Card, Typography, Space, Button } from 'antd';
import { Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { Category } from '../../hooks/useCategories';

const { Text, Title } = Typography;

interface CategoriesGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesGrid({ categories, onEdit, onDelete }: CategoriesGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {categories.map((cat) => (
        <Card key={cat.id} size="small">
          <Title level={5} style={{ margin: 0 }}>{cat.name}</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{cat._count.products} products</Text>
          <RoleGuard minRole="MANAGER">
            <Space style={{ marginTop: 12 }}>
              <Button type="text" icon={<Edit20Regular />} size="small" onClick={() => onEdit(cat)} />
              <RoleGuard minRole="ADMIN">
                <Button type="text" icon={<Delete20Regular />} size="small" danger onClick={() => onDelete(cat)} />
              </RoleGuard>
            </Space>
          </RoleGuard>
        </Card>
      ))}
    </div>
  );
}
