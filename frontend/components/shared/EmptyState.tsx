import { makeStyles, tokens, Body1, Title3, Button } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
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
      <Title3>{title}</Title3>
      {description && <Body1>{description}</Body1>}
      {action && <Button appearance="primary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
