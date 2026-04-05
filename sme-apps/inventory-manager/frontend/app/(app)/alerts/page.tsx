'use client';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Header } from '../../../components/shell/Header';
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
    <>
      <Header title="Reorder Alerts" />
      <div style={{ padding: tokens.spacingVerticalL }}>
        {(alerts ?? []).length === 0 ? (
          <EmptyState title="No reorder alerts" description="All stock levels are above their thresholds." />
        ) : (
          <AlertsTable alerts={alerts ?? []} onUpdateThreshold={handleUpdateThreshold} />
        )}
      </div>
    </>
  );
}
