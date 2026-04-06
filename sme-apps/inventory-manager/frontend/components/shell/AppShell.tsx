'use client';
import { makeStyles } from '@fluentui/react-components';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--p-bg)',
  },
  body: {
    display: 'flex',
    flex: '1',
    overflow: 'hidden',
    minHeight: '0',
  },
  main: {
    flex: '1',
    overflowY: 'auto',
    backgroundColor: 'var(--p-bg)',
  },
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.shell}>
      <GlobalHeader />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
