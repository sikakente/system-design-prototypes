'use client';
import { useState } from 'react';
import { makeStyles, tokens, Button, Spinner, MessageBar, MessageBarBody, MessageBarActions, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Input, Field } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { CategoriesGrid } from '../../../components/categories/CategoriesGrid';
import { EmptyState } from '../../../components/shared/EmptyState';
import { RoleGuard } from '../../../components/shared/RoleGuard';
import { useCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../../hooks/useCategories';
import { mutate } from 'swr';

const useStyles = makeStyles({
  page: {
    padding: '28px 32px',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
});

export default function CategoriesPage() {
  const styles = useStyles();
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
      <div className={styles.page}>
        <div className={styles.header}>
          <RoleGuard minRole="MANAGER">
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => { setEditing(undefined); setName(''); setDialogOpen(true); }}>
              Add Category
            </Button>
          </RoleGuard>
        </div>
        {opError && <MessageBar intent="error"><MessageBarBody>{opError}</MessageBarBody><MessageBarActions containerAction={<Button appearance="transparent" onClick={() => setOpError('')}>✕</Button>} /></MessageBar>}
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
