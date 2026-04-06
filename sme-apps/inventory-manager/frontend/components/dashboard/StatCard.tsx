import React from 'react';
import { makeStyles, mergeClasses } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    backgroundColor: 'var(--p-card)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid var(--p-border)',
    boxShadow: 'var(--p-shadow)',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    animationName: {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    animationDuration: '0.4s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  cardFeatured: {
    backgroundColor: 'var(--p-primary)',
    border: '1px solid var(--p-primary)',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--p-primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--p-primary)',
    flexShrink: 0,
  },
  iconBoxFeatured: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--p-text-2)',
    marginBottom: '4px',
  },
  labelFeatured: {
    color: 'rgba(255,255,255,0.8)',
  },
  value: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--p-text)',
    letterSpacing: '-0.02em',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1',
  },
  valueFeatured: {
    color: 'white',
  },
  valueDanger: {
    color: 'var(--p-red)',
  },
});

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  featured?: boolean;
  accent?: 'default' | 'danger';
  animationDelay?: string;
}

export function StatCard({
  label,
  value,
  icon,
  featured = false,
  accent = 'default',
  animationDelay,
}: StatCardProps) {
  const styles = useStyles();

  return (
    <div
      className={mergeClasses(styles.card, featured ? styles.cardFeatured : undefined)}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className={mergeClasses(styles.iconBox, featured ? styles.iconBoxFeatured : undefined)}>
        {icon}
      </div>
      <div className={styles.bottom}>
        <div className={mergeClasses(styles.label, featured ? styles.labelFeatured : undefined)}>
          {label}
        </div>
        <div
          className={mergeClasses(
            styles.value,
            featured ? styles.valueFeatured : undefined,
            !featured && accent === 'danger' ? styles.valueDanger : undefined,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
