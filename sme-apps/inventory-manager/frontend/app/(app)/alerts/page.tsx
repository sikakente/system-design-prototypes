'use client';
import { Spin, Alert } from 'antd';
import { AlertsTable } from '../../../components/alerts/AlertsTable';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useAlerts, updateThreshold } from '../../../hooks/useAlerts';
import { mutate } from 'swr';

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();

  const handleUpdateThreshold = async (productId: string, threshold: number) => {
    await updateThreshold(productId, threshold);
    mutate('/alerts');
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '28px 32px' }}>
      <Spin />
    </div>
  );
  if (error) return <Alert type="error" message="Failed to load alerts" showIcon />;

  return (
    <div style={{ padding: '28px 32px', background: '#f5f5f5', minHeight: '100%' }}>
      {(alerts ?? []).length === 0 ? (
        <EmptyState title="No reorder alerts" description="All stock levels are above their thresholds." />
      ) : (
        <AlertsTable alerts={alerts ?? []} onUpdateThreshold={handleUpdateThreshold} />
      )}
    </div>
  );
}
