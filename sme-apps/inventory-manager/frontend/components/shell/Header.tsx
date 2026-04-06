'use client';
import { makeStyles, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  header: {
    height: '56px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
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
      <Text size={500} weight="semibold">{title}</Text>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
