'use client';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { Header } from '../../../components/shell/Header';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { LowStockPanel } from '../../../components/dashboard/LowStockPanel';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useAlerts } from '../../../hooks/useAlerts';
import { useTeam } from '../../../hooks/useTeam';

const useStyles = makeStyles({
  content: { padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL },
  stats: { display: 'flex', gap: tokens.spacingHorizontalM, flexWrap: 'wrap' },
  bottom: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacingHorizontalM },
});

export default function DashboardPage() {
  const styles = useStyles();
  const { data: products, isLoading: pLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: alerts } = useAlerts();
  const { data: team } = useTeam();

  if (pLoading) return <Spinner label="Loading..." />;

  return (
    <>
      <Header title="Dashboard" />
      <div className={styles.content}>
        <div className={styles.stats}>
          <StatCard label="Total Items" value={products?.length ?? 0} />
          <StatCard label="Low Stock" value={alerts?.length ?? 0} accent={alerts?.length ? 'danger' : 'default'} />
          <StatCard label="Categories" value={categories?.length ?? 0} />
          <StatCard label="Team Members" value={team?.length ?? 0} />
        </div>
        <div className={styles.bottom}>
          <ActivityFeed products={products ?? []} />
          <LowStockPanel alerts={alerts ?? []} />
        </div>
      </div>
    </>
  );
}
