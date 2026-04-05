'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Input, Spinner, MessageBar, MessageBarBody, MessageBarActions } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { Header } from '../../../components/shell/Header';
import { ProductsTable } from '../../../components/products/ProductsTable';
import { ProductForm } from '../../../components/products/ProductForm';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { RoleGuard } from '../../../components/shared/RoleGuard';
import { useProducts, createProduct, updateProduct, deleteProduct, type Product } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { mutate } from 'swr';

const useStyles = makeStyles({
  content: { padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  toolbar: { display: 'flex', gap: tokens.spacingHorizontalM, alignItems: 'center' },
});

export default function ProductsPage() {
  const styles = useStyles();
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

  if (isLoading) return <Spinner label="Loading products..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load products</MessageBarBody></MessageBar>;

  return (
    <>
      <Header
        title="Products"
        actions={
          <RoleGuard minRole="MANAGER">
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
              Add Product
            </Button>
          </RoleGuard>
        }
      />
      <div className={styles.content}>
        {opError && <MessageBar intent="error"><MessageBarBody>{opError}</MessageBarBody><MessageBarActions containerAction={<Button appearance="transparent" onClick={() => setOpError('')}>✕</Button>} /></MessageBar>}
        <div className={styles.toolbar}>
          <Input placeholder="Search by name or SKU..." value={search} onChange={(_, d) => setSearch(d.value)} style={{ maxWidth: 320 }} />
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
      </div>
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
    </>
  );
}
