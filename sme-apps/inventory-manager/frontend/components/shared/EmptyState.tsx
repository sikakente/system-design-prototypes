import { Text, Button, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
  },
});

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Text size={500} weight="semibold">{title}</Text>
      {description && <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>{description}</Text>}
      {action && (
        <Button appearance="primary" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
