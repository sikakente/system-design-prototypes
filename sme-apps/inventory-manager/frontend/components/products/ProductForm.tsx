'use client';
import { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, Spin, Space } from 'antd';
import type { Product } from '../../hooks/useProducts';
import type { Category } from '../../hooks/useCategories';

interface ProductFormProps {
  open: boolean;
  product?: Product;
  categories: Category[];
  onSubmit: (data: Omit<Product, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY = { name: '', sku: '', quantity: 0, reorderThreshold: 10, unit: '', categoryId: '' };

export function ProductForm({ open, product, categories, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? {
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      reorderThreshold: product.reorderThreshold,
      unit: product.unit ?? '',
      categoryId: product.categoryId,
    } : EMPTY);
  }, [product, open]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: field === 'quantity' || field === 'reorderThreshold' ? Number(val) : val,
    }));
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

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Drawer
      open={open}
      placement="right"
      width={480}
      title={product ? 'Edit Product' : 'Add Product'}
      onClose={onClose}
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} disabled={saving} icon={saving ? <Spin size="small" /> : undefined}>
            Save
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={form.name} onChange={handleInputChange('name')} />
        </Form.Item>
        <Form.Item label="SKU">
          <Input value={form.sku} onChange={handleInputChange('sku')} />
        </Form.Item>
        <Form.Item label="Quantity">
          <Input type="number" value={String(form.quantity)} onChange={handleInputChange('quantity')} />
        </Form.Item>
        <Form.Item label="Reorder Threshold">
          <Input type="number" value={String(form.reorderThreshold)} onChange={handleInputChange('reorderThreshold')} />
        </Form.Item>
        <Form.Item label="Unit (optional)">
          <Input value={form.unit} onChange={handleInputChange('unit')} placeholder="pcs, kg, boxes..." />
        </Form.Item>
        <Form.Item label="Category">
          <Select
            value={form.categoryId || undefined}
            onChange={(val) => setForm((prev) => ({ ...prev, categoryId: val }))}
            options={categoryOptions}
            placeholder="Select category..."
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
