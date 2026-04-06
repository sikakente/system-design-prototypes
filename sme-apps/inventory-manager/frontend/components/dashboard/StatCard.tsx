import React from 'react';
import { Card, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: tokens.spacingHorizontalXXL,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    borderRadius: tokens.borderRadius2XLarge,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    animationName: {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    animationDuration: '0.4s',
    animationFillMode: 'both',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  cardFeatured: {
    backgroundColor: tokens.colorBrandBackground,
    border: `1px solid ${tokens.colorBrandBackground}`,
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    flexShrink: '0',
  },
  iconBoxFeatured: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: tokens.colorNeutralForegroundOnBrand,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginBottom: '4px',
  },
  labelFeatured: {
    color: 'rgba(255,255,255,0.8)',
  },
  value: {
    fontSize: '26px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.02em',
    fontFamily: tokens.fontFamilyBase,
    lineHeight: '1',
  },
  valueFeatured: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
  valueDanger: {
    color: tokens.colorPaletteRedForeground2,
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
    <Card
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
    </Card>
  );
}
