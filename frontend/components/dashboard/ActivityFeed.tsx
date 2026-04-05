import { makeStyles, tokens, Card, Body1, Text, Subtitle2 } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: { padding: tokens.spacingVerticalM },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: tokens.colorNeutralForeground3 },
});

interface ActivityFeedProps {
  products: Product[];
}

export function ActivityFeed({ products }: ActivityFeedProps) {
  const styles = useStyles();
  const recent = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Card className={styles.card}>
      <Subtitle2>Recent Activity</Subtitle2>
      {recent.length === 0 ? (
        <Body1>No recent changes</Body1>
      ) : (
        <ul className={styles.list}>
          {recent.map((p) => (
            <li key={p.id} className={styles.item}>
              <Body1>{p.name} — qty {p.quantity}</Body1>
              <Text size={100} className={styles.time}>
                {new Date(p.updatedAt).toLocaleDateString()}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
