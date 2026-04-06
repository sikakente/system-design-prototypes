'use client';
import { useState } from 'react';
import { Button, Spin, Alert, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CategoriesGrid } from '../../../components/categories/CategoriesGrid';
import { EmptyState } from '../../../components/shared/EmptyState';
import { RoleGuard } from '../../../components/shared/RoleGuard';
import { useCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../../hooks/useCategories';
import { mutate } from 'swr';

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [name, setName] = useState('');
  const [opError, setOpError] = useState('');

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }
      mutate('/categories');
      setDialogOpen(false);
      setName('');
      setEditing(undefined);
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      mutate('/categories');
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '28px 32px' }}>
      <Spin />
    </div>
  );
  if (error) return <Alert type="error" title="Failed to load categories" showIcon />;

  return (
    <div style={{ padding: '28px 32px', background: '#f5f5f5', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <RoleGuard minRole="MANAGER">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setName(''); setDialogOpen(true); }}>
            Add Category
          </Button>
        </RoleGuard>
      </div>
      {opError && (
        <Alert
          type="error"
          message={opError}
          showIcon
          closable
          onClose={() => setOpError('')}
          style={{ marginBottom: 16 }}
        />
      )}
      {(categories ?? []).length === 0 ? (
        <EmptyState title="No categories yet" description="Organise your products by adding categories." action={{ label: 'Add Category', onClick: () => setDialogOpen(true) }} />
      ) : (
        <CategoriesGrid
          categories={categories ?? []}
          onEdit={(cat) => { setEditing(cat); setName(cat.name); setDialogOpen(true); }}
          onDelete={handleDelete}
        />
      )}
      <Modal
        open={dialogOpen}
        title={editing ? 'Edit Category' : 'Add Category'}
        onOk={handleSave}
        onCancel={() => { setDialogOpen(false); setEditing(undefined); setName(''); }}
        okText="Save"
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </Form.Item>
        </Form>
        {opError && <Alert type="error" title={opError} showIcon style={{ marginTop: 8 }} />}
      </Modal>
    </div>
  );
}
