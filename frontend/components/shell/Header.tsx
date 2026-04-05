'use client';
import { makeStyles, tokens, Title3 } from '@fluentui/react-components';

const useStyles = makeStyles({
  header: {
    height: '56px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
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
      <Title3>{title}</Title3>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
