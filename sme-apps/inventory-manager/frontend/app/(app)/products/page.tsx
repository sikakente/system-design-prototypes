'use client';
import { useState } from 'react';
import { Button, Input, Spin, Alert } from 'antd';
import { Add20Regular } from '@fluentui/react-icons';
import { ProductsTable } from '../../../components/products/ProductsTable';
import { ProductForm } from '../../../components/products/ProductForm';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { useProducts, createProduct, updateProduct, deleteProduct, type Product } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { mutate } from 'swr';

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Product | undefined>();
  const [opError, setOpError] = useState('');

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      mutate((key: string) => key.startsWith('/products'));
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      mutate((key: string) => key.startsWith('/products'));
      setDeleteTarget(undefined);
    } catch (e: unknown) {
      setOpError((e as Error).message);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spin />
    </div>
  );
  if (error) return <Alert type="error" title="Failed to load products" showIcon />;

  return (
    <div style={{ padding: '28px 32px', backgroundColor: '#f5f5f5', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Button type="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          Add Product
        </Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No products found" description="Add your first product to get started." action={{ label: 'Add Product', onClick: () => setFormOpen(true) }} />
      ) : (
        <ProductsTable
          products={filtered}
          onEdit={(p) => { setEditing(p); setFormOpen(true); }}
          onDelete={setDeleteTarget}
        />
      )}
      <ProductForm
        open={formOpen}
        product={editing}
        categories={categories ?? []}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />
      {deleteTarget && (
        <ConfirmDialog
          trigger={<span />}
          title="Delete Product"
          description={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
