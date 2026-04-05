import { makeStyles, tokens, Card, Title2, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalL,
    minWidth: '140px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    display: 'block',
    marginBottom: tokens.spacingVerticalXS,
  },
});

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: 'default' | 'danger';
}

export function StatCard({ label, value, accent = 'default' }: StatCardProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <Text size={200} className={styles.label}>{label}</Text>
      <Title2 style={{ color: accent === 'danger' ? tokens.colorStatusDangerForeground1 : undefined }}>
        {value}
      </Title2>
    </Card>
  );
}
