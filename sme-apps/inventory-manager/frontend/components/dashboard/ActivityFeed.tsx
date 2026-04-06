import { makeStyles } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

const useStyles = makeStyles({
  card: {
    backgroundColor: 'var(--p-card)',
    border: '1px solid var(--p-border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--p-shadow)',
  },
  heading: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--p-text-3)',
    marginBottom: '20px',
  },
  empty: {
    fontSize: '13px',
    color: 'var(--p-text-2)',
    fontStyle: 'italic',
  },
  timeline: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    position: 'relative',
    animationName: {
      from: { opacity: '0', transform: 'translateX(-6px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    animationDuration: '0.35s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  timelineTrack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '4px',
    flexShrink: 0,
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: 'var(--p-primary)',
    flexShrink: 0,
  },
  line: {
    width: '1px',
    flex: '1',
    minHeight: '16px',
    backgroundColor: 'var(--p-border)',
    marginTop: '4px',
  },
  itemBody: {
    flex: '1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minWidth: '0',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--p-border)',
  },
  itemBodyLast: {
    borderBottom: 'none',
    paddingBottom: '0',
  },
  name: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--p-text)',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  qty: {
    fontSize: '11px',
    color: 'var(--p-primary)',
  },
  time: {
    fontSize: '10px',
    color: 'var(--p-text-3)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    paddingTop: '1px',
  },
});

interface ActivityFeedProps {
  products: Product[];
}

export function ActivityFeed({ products }: ActivityFeedProps) {
  const styles = useStyles();
  const recent = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className={styles.card}>
      <div className={styles.heading}>Recent Activity</div>
      {recent.length === 0 ? (
        <div className={styles.empty}>No recent changes</div>
      ) : (
        <ul className={styles.timeline}>
          {recent.map((p, i) => (
            <li
              key={p.id}
              className={styles.item}
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
            >
              <div className={styles.timelineTrack}>
                <div className={styles.dot} />
                {i < recent.length - 1 && <div className={styles.line} />}
              </div>
              <div className={cx(styles.itemBody, i === recent.length - 1 && styles.itemBodyLast)}>
                <div>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.qty}>qty {p.quantity}</div>
                </div>
                <div className={styles.time}>
                  {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
