'use client';
import { makeStyles } from '@fluentui/react-components';
import { Box20Regular, Alert20Regular, Tag20Regular, People20Regular } from '@fluentui/react-icons';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { LowStockPanel } from '../../../components/dashboard/LowStockPanel';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useAlerts } from '../../../hooks/useAlerts';
import { useTeam } from '../../../hooks/useTeam';

const useStyles = makeStyles({
  page: {
    minHeight: '100%',
    backgroundColor: 'var(--p-bg)',
  },
  content: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  bottom: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
  },
});

export default function DashboardPage() {
  const styles = useStyles();
  const { data: products, isLoading: pLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: alerts } = useAlerts();
  const { data: team } = useTeam();

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.stats}>
          <StatCard
            label="Total Items"
            value={pLoading ? '—' : (products?.length ?? 0)}
            icon={<Box20Regular />}
            featured={true}
            animationDelay="0s"
          />
          <StatCard
            label="Low Stock"
            value={alerts?.length ?? '—'}
            icon={<Alert20Regular />}
            accent={(alerts?.length ?? 0) > 0 ? 'danger' : 'default'}
            animationDelay="0.07s"
          />
          <StatCard
            label="Categories"
            value={categories?.length ?? '—'}
            icon={<Tag20Regular />}
            animationDelay="0.14s"
          />
          <StatCard
            label="Team Members"
            value={team?.length ?? '—'}
            icon={<People20Regular />}
            animationDelay="0.21s"
          />
        </div>
        <div className={styles.bottom}>
          <ActivityFeed products={products ?? []} />
          <LowStockPanel alerts={alerts ?? []} />
        </div>
      </div>
    </div>
  );
}
