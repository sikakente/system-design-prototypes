'use client';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    flex: '1',
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
