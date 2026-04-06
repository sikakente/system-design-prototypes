'use client';
import { makeStyles, Avatar } from '@fluentui/react-components';
import { Search20Regular, AlertBadge20Regular } from '@fluentui/react-icons';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Home Inventory System' },
  '/products': { title: 'Products', subtitle: 'Manage your inventory' },
  '/categories': { title: 'Categories', subtitle: 'Organize products' },
  '/alerts': { title: 'Reorder Alerts', subtitle: 'Stock level monitoring' },
  '/team': { title: 'Team', subtitle: 'Manage team members' },
};

const useStyles = makeStyles({
  header: {
    height: '72px',
    backgroundColor: 'var(--p-header-bg)',
    borderBottom: '1px solid var(--p-border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px 0 0',
    position: 'sticky',
    top: '0',
    zIndex: '50',
    boxShadow: 'var(--p-shadow)',
  },
  leftSection: {
    width: '260px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 24px',
    flexShrink: 0,
  },
  greetingStack: {
    display: 'flex',
    flexDirection: 'column',
  },
  greetingLabel: {
    fontSize: '12px',
    color: 'var(--p-text-2)',
    lineHeight: '1.3',
  },
  greetingName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--p-text)',
    lineHeight: '1.3',
    fontFamily: 'var(--p-sans)',
  },
  divider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--p-border)',
    flexShrink: 0,
  },
  centerSection: {
    flex: '1',
    paddingLeft: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--p-text)',
    letterSpacing: '-0.02em',
    margin: '0',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.2',
  },
  pageSubtitle: {
    fontSize: '12px',
    color: 'var(--p-text-2)',
    margin: '0',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.4',
  },
  rightSection: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchBar: {
    width: '200px',
    borderRadius: '9999px',
    border: '1px solid var(--p-border)',
    backgroundColor: 'var(--p-bg)',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--p-text-3)',
    fontFamily: 'var(--p-sans)',
    cursor: 'pointer',
  },
  notificationBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--p-border)',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--p-text-2)',
  },
});

export function GlobalHeader() {
  const styles = useStyles();
  const pathname = usePathname();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const pageMeta =
    Object.entries(PAGE_META).find(([path]) => pathname.startsWith(path))?.[1] ??
    { title: 'StockFlow', subtitle: 'Inventory Management' };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Avatar name={user?.name ?? 'User'} size={40} />
        <div className={styles.greetingStack}>
          <span className={styles.greetingLabel}>Welcome back,</span>
          <span className={styles.greetingName}>{firstName}!</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.centerSection}>
        <h1 className={styles.pageTitle}>{pageMeta.title}</h1>
        <p className={styles.pageSubtitle}>
          {pageMeta.subtitle} &middot; {formattedDate}
        </p>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.searchBar}>
          <Search20Regular />
          <span>Search...</span>
        </div>
        <div className={styles.notificationBtn}>
          <AlertBadge20Regular />
        </div>
      </div>
    </header>
  );
}
