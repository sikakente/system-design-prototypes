import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '64px 32px',
  },
  title: {
    fontFamily: 'var(--p-sans)',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--p-text)',
    margin: '0',
  },
  description: {
    fontFamily: 'var(--p-sans)',
    fontSize: '13px',
    color: 'var(--p-text-2)',
    margin: '0',
  },
  btn: {
    marginTop: '8px',
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--p-primary)',
    color: 'white',
    fontFamily: 'var(--p-sans)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
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
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <button className={styles.btn} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
