'use client';
import {
  makeStyles,
  mergeClasses,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuGroup,
  MenuGroupHeader,
  MenuDivider,
  MenuItem,
} from '@fluentui/react-components';
import {
  Home20Regular,
  Box20Regular,
  Tag20Regular,
  Alert20Regular,
  People20Regular,
  SignOut20Regular,
  ChevronDown20Regular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../shared/RoleGuard';

const useStyles = makeStyles({
  sidebar: {
    width: '260px',
    minHeight: '100%',
    backgroundColor: 'var(--p-sidebar-bg)',
    borderRight: '1px solid var(--p-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
  },
  companySection: {
    padding: '20px 16px',
    borderBottom: '1px solid var(--p-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--p-primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  companyTextStack: {
    display: 'flex',
    flexDirection: 'column',
  },
  companyLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: 'var(--p-text-2)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.3',
  },
  companyName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--p-text)',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.3',
  },
  chevron: {
    color: 'var(--p-text-3)',
    marginLeft: 'auto',
  },
  menuLabel: {
    padding: '20px 20px 8px',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    color: 'var(--p-text-3)',
    textTransform: 'uppercase',
    fontFamily: 'var(--p-sans)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 12px',
    flex: '1',
  },
  link: {
    padding: '10px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--p-text-2)',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    fontFamily: 'var(--p-sans)',
  },
  linkActive: {
    backgroundColor: 'var(--p-primary)',
    color: 'white',
    borderRadius: '8px',
  },
  iconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--p-primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--p-primary)',
    flexShrink: 0,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  userMenu: {
    padding: '16px 12px',
    borderTop: '1px solid var(--p-border)',
  },
  avatarTrigger: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--p-text)',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.3',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--p-text-2)',
    fontFamily: 'var(--p-sans)',
    lineHeight: '1.3',
  },
  userTextStack: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  menuHeader: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  menuRole: {
    color: 'var(--p-text-2)',
  },
});

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home20Regular },
  { href: '/products', label: 'Products', Icon: Box20Regular },
  { href: '/categories', label: 'Categories', Icon: Tag20Regular },
  { href: '/alerts', label: 'Reorder Alerts', Icon: Alert20Regular },
];

export function Sidebar() {
  const styles = useStyles();
  const pathname = usePathname();
  const { user, role } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.companySection}>
        <div className={styles.logoBox}>📦</div>
        <div className={styles.companyTextStack}>
          <span className={styles.companyLabel}>Company</span>
          <span className={styles.companyName}>StockFlow</span>
        </div>
        <ChevronDown20Regular className={styles.chevron} />
      </div>

      <div className={styles.menuLabel}>MENU</div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={mergeClasses(styles.link, isActive ? styles.linkActive : undefined)}
            >
              <div
                className={mergeClasses(
                  styles.iconContainer,
                  isActive ? styles.iconContainerActive : undefined
                )}
              >
                <Icon />
              </div>
              {label}
            </Link>
          );
        })}
        <RoleGuard minRole="MANAGER">
          <Link
            href="/team"
            className={mergeClasses(
              styles.link,
              pathname === '/team' ? styles.linkActive : undefined
            )}
          >
            <div
              className={mergeClasses(
                styles.iconContainer,
                pathname === '/team' ? styles.iconContainerActive : undefined
              )}
            >
              <People20Regular />
            </div>
            Team
          </Link>
        </RoleGuard>
      </nav>

      <div className={styles.userMenu}>
        <Menu>
          <MenuTrigger>
            <button className={styles.avatarTrigger}>
              <Avatar name={user?.name ?? 'User'} size={32} />
              <div className={styles.userTextStack}>
                <span className={styles.userName}>{user?.name ?? 'User'}</span>
                <span className={styles.userRole}>{role}</span>
              </div>
            </button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuGroup>
                <MenuGroupHeader className={styles.menuHeader}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name ?? 'User'}</span>
                  <span className={styles.menuRole} style={{ fontSize: '12px', color: 'var(--p-text-2)' }}>{role}</span>
                </MenuGroupHeader>
              </MenuGroup>
              <MenuDivider />
              <MenuItem icon={<SignOut20Regular />}>
                <a href="/auth/logout">Sign out</a>
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </aside>
  );
}
