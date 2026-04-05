'use client';
import { useParams, useRouter } from 'next/navigation';
import { Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Header } from '../../../../components/shell/Header';
import { ProductForm } from '../../../../components/products/ProductForm';
import { useProducts, updateProduct } from '../../../../hooks/useProducts';
import { useCategories } from '../../../../hooks/useCategories';
import { mutate } from 'swr';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

  const product = products?.find((p) => p.id === id);

  if (isLoading) return <Spinner label="Loading..." />;
  if (!product) return <MessageBar intent="error"><MessageBarBody>Product not found</MessageBarBody></MessageBar>;

  return (
    <>
      <Header title={product.name} />
      <ProductForm
        open
        product={product}
        categories={categories ?? []}
        onSubmit={async (data) => {
          await updateProduct(id, data);
          mutate((key: string) => key.startsWith('/products'));
          router.push('/products');
        }}
        onClose={() => router.push('/products')}
      />
    </>
  );
}
