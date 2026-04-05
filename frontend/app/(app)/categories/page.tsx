'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Spinner, MessageBar, MessageBarBody, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Input, Field } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { Header } from '../../../components/shell/Header';
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

  if (isLoading) return <Spinner label="Loading categories..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load categories</MessageBarBody></MessageBar>;

  return (
    <>
      <Header
        title="Categories"
        actions={
          <RoleGuard minRole="MANAGER">
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setName(''); setDialogOpen(true); }}>
              Add Category
            </Button>
          </RoleGuard>
        }
      />
      <div style={{ padding: tokens.spacingVerticalL }}>
        {opError && <MessageBar intent="error" onDismiss={() => setOpError('')}><MessageBarBody>{opError}</MessageBarBody></MessageBar>}
        {(categories ?? []).length === 0 ? (
          <EmptyState title="No categories yet" description="Organise your products by adding categories." action={{ label: 'Add Category', onClick: () => setDialogOpen(true) }} />
        ) : (
          <CategoriesGrid
            categories={categories ?? []}
            onEdit={(cat) => { setEditing(cat); setName(cat.name); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogContent>
              <Field label="Name"><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={handleSave}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
