'use client';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { AlertsTable } from '../../../components/alerts/AlertsTable';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useAlerts, updateThreshold } from '../../../hooks/useAlerts';
import { mutate } from 'swr';

const useStyles = makeStyles({
  page: {
    padding: '28px 32px',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '100%',
  },
});

export default function AlertsPage() {
  const styles = useStyles();
  const { data: alerts, isLoading, error } = useAlerts();

  const handleUpdateThreshold = async (productId: string, threshold: number) => {
    await updateThreshold(productId, threshold);
    mutate('/alerts');
  };

  if (isLoading) return <Spinner label="Loading alerts..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load alerts</MessageBarBody></MessageBar>;

  return (
    <div className={styles.page}>
      {(alerts ?? []).length === 0 ? (
        <EmptyState title="No reorder alerts" description="All stock levels are above their thresholds." />
      ) : (
        <AlertsTable alerts={alerts ?? []} onUpdateThreshold={handleUpdateThreshold} />
      )}
    </div>
  );
}
