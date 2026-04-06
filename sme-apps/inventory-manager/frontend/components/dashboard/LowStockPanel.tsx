import { Card, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import type { Product } from '../../hooks/useProducts';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadius2XLarge,
    padding: tokens.spacingHorizontalXXL,
    boxShadow: tokens.shadow4,
    position: 'relative',
  },
  topBarDanger: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: tokens.colorPaletteRedForeground2,
    borderRadius: `${tokens.borderRadius2XLarge} ${tokens.borderRadius2XLarge} 0 0`,
  },
  topBarHealthy: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: tokens.colorPaletteGreenForeground2,
    borderRadius: `${tokens.borderRadius2XLarge} ${tokens.borderRadius2XLarge} 0 0`,
  },
  heading: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: tokens.colorNeutralForeground3,
    marginBottom: '6px',
  },
  countDanger: {
    fontSize: '28px',
    fontWeight: tokens.fontWeightBold,
    lineHeight: '1',
    color: tokens.colorPaletteRedForeground2,
    letterSpacing: '-0.03em',
    marginBottom: '16px',
    fontFamily: tokens.fontFamilyBase,
  },
  countHealthy: {
    fontSize: '28px',
    fontWeight: tokens.fontWeightBold,
    lineHeight: '1',
    color: tokens.colorPaletteGreenForeground2,
    letterSpacing: '-0.03em',
    marginBottom: '16px',
    fontFamily: tokens.fontFamilyBase,
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
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    animationName: {
      from: { opacity: '0', transform: 'translateX(-6px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    animationDuration: '0.35s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  listItemLast: {
    borderBottomStyle: 'none',
  },
  itemName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
  itemQty: {
    fontSize: '11px',
    color: tokens.colorPaletteRedForeground2,
    fontWeight: tokens.fontWeightSemibold,
    flexShrink: '0',
  },
  healthyMsg: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorPaletteGreenForeground2,
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
    <Card className={styles.card}>
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
    </Card>
  );
}
