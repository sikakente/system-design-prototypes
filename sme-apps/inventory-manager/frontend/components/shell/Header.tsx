'use client';
import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  header: {
    height: '60px',
    backgroundColor: 'var(--p-card)',
    borderBottom: '1px solid var(--p-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
  },
  title: {
    fontFamily: 'var(--p-sans)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--p-text)',
    margin: '0',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
});

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const styles = useStyles();
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
