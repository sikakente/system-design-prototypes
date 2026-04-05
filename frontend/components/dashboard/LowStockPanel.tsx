import { makeStyles, tokens, Card, Subtitle2, Body1, Text } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: { padding: tokens.spacingVerticalM },
  title: { color: tokens.colorStatusDangerForeground1 },
  list: { listStyle: 'none', padding: 0, margin: `${tokens.spacingVerticalS} 0 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
});

interface LowStockPanelProps {
  alerts: Product[];
}

export function LowStockPanel({ alerts }: LowStockPanelProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card} style={{ borderColor: tokens.colorStatusDangerBorder1 }}>
      <Subtitle2 className={styles.title}>⚠ Low Stock ({alerts.length})</Subtitle2>
      {alerts.length === 0 ? (
        <Body1>All stock levels healthy</Body1>
      ) : (
        <ul className={styles.list}>
          {alerts.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Body1>{p.name}</Body1>
              <Text size={100} style={{ color: tokens.colorStatusDangerForeground1 }}>
                {' '}— {p.quantity} left
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
