'use client';
import { Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
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

  if (isLoading) return <Spinner label="Loading alerts..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load alerts</MessageBarBody></MessageBar>;

  return (
    <div style={{ padding: '28px 32px', backgroundColor: 'var(--p-bg)', minHeight: '100%' }}>
      {(alerts ?? []).length === 0 ? (
        <EmptyState title="No reorder alerts" description="All stock levels are above their thresholds." />
      ) : (
        <AlertsTable alerts={alerts ?? []} onUpdateThreshold={handleUpdateThreshold} />
      )}
    </div>
  );
}
