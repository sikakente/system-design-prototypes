'use client';
import { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Field,
  Input,
  Select,
  Button,
  Spinner,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import type { Product } from '../../hooks/useProducts';
import type { Category } from '../../hooks/useCategories';

const useStyles = makeStyles({
  body: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, padding: tokens.spacingVerticalM },
  footer: { display: 'flex', gap: tokens.spacingHorizontalS, justifyContent: 'flex-end', padding: tokens.spacingVerticalM },
});

interface ProductFormProps {
  open: boolean;
  product?: Product;
  categories: Category[];
  onSubmit: (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY = { name: '', sku: '', quantity: 0, reorderThreshold: 10, unit: '', categoryId: '' };

export function ProductForm({ open, product, categories, onSubmit, onClose }: ProductFormProps) {
  const styles = useStyles();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? { name: product.name, sku: product.sku, quantity: product.quantity, reorderThreshold: product.reorderThreshold, unit: product.unit ?? '', categoryId: product.categoryId } : EMPTY);
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' || name === 'reorderThreshold' ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} position="end" size="medium">
      <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />}>
          {product ? 'Edit Product' : 'Add Product'}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.body}>
          <label>Name<Input name="name" value={form.name} onChange={handleChange} /></label>
          <label>SKU<Input name="sku" value={form.sku} onChange={handleChange} /></label>
          <label>Quantity<Input name="quantity" type="number" value={String(form.quantity)} onChange={handleChange} /></label>
          <label>Reorder Threshold<Input name="reorderThreshold" type="number" value={String(form.reorderThreshold)} onChange={handleChange} /></label>
          <label>Unit (optional)<Input name="unit" value={form.unit} onChange={handleChange} placeholder="pcs, kg, boxes..." /></label>
          <label>Category
            <Select name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
        </div>
        <div className={styles.footer}>
          <Button appearance="secondary" onClick={onClose}>Cancel</Button>
          <Button appearance="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="tiny" /> : 'Save'}
          </Button>
        </div>
      </DrawerBody>
    </Drawer>
  );
}
