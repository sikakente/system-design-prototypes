import { makeStyles, mergeClasses } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: {
    backgroundColor: 'var(--p-card)',
    border: '1px solid var(--p-border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--p-shadow)',
    position: 'relative',
  },
  topBarDanger: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: 'var(--p-red)',
    borderRadius: '12px 12px 0 0',
  },
  topBarHealthy: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: 'var(--p-green)',
    borderRadius: '12px 12px 0 0',
  },
  heading: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--p-text-3)',
    marginBottom: '6px',
  },
  countDanger: {
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1',
    color: 'var(--p-red)',
    letterSpacing: '-0.03em',
    marginBottom: '16px',
    fontFamily: 'var(--p-sans)',
  },
  countHealthy: {
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1',
    color: 'var(--p-green)',
    letterSpacing: '-0.03em',
    marginBottom: '16px',
    fontFamily: 'var(--p-sans)',
  },
  list: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--p-border)',
    animationName: {
      from: { opacity: '0', transform: 'translateX(-6px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    animationDuration: '0.35s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  listItemLast: {
    borderBottom: 'none',
  },
  itemName: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--p-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
  itemQty: {
    fontSize: '11px',
    color: 'var(--p-red)',
    fontWeight: '600',
    flexShrink: 0,
  },
  healthyMsg: {
    fontSize: '12px',
    color: 'var(--p-green)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
});

interface LowStockPanelProps {
  alerts: Product[];
}

export function LowStockPanel({ alerts }: LowStockPanelProps) {
  const styles = useStyles();
  const isHealthy = alerts.length === 0;
  const visible = alerts.slice(0, 6);

  return (
    <div className={styles.card}>
      <div className={isHealthy ? styles.topBarHealthy : styles.topBarDanger} />
      <div className={styles.heading}>Low Stock</div>
      <div className={isHealthy ? styles.countHealthy : styles.countDanger}>
        {alerts.length}
      </div>
      {isHealthy ? (
        <div className={styles.healthyMsg}>
          <span>&#10003;</span>
          <span>All levels healthy</span>
        </div>
      ) : (
        <ul className={styles.list}>
          {visible.map((p, i) => (
            <li
              key={p.id}
              className={mergeClasses(
                styles.listItem,
                i === visible.length - 1 ? styles.listItemLast : undefined,
              )}
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
            >
              <span className={styles.itemName}>{p.name}</span>
              <span className={styles.itemQty}>{p.quantity} left</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
