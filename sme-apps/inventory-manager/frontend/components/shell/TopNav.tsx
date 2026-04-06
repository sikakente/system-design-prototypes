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
  Body1Strong,
  Caption1,
  Button,
} from '@fluentui/react-components';
import {
  HomeOutlined,
  InboxOutlined,
  TagOutlined,
  AlertOutlined,
  TeamOutlined,
  SearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../shared/RoleGuard';

const useStyles = makeStyles({
  topNav: {
    height: '60px',
    backgroundColor: 'var(--v-bg)',
    borderBottom: '1px solid var(--v-border)',
    position: 'sticky',
    top: '0',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: '16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
    fontFamily: 'var(--v-sans)',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--v-text)',
  },
  nav: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '20px',
    textDecoration: 'none',
    fontFamily: 'var(--v-sans)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--v-text-2)',
    backgroundColor: 'transparent',
    transition: 'color 0.15s',
  },
  navItemActive: {
    backgroundColor: 'var(--v-pill-bg)',
    color: 'var(--v-pill-text)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  searchButton: {
    color: 'var(--v-text-2)',
    backgroundColor: 'transparent',
    minWidth: 'unset',
  },
  menuHeader: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '160px',
  },
  menuRole: {
    color: 'var(--v-text-2)',
  },
  avatarButton: {
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
  },
});

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: HomeOutlined, exact: false },
  { href: '/products', label: 'Products', Icon: InboxOutlined, exact: false },
  { href: '/categories', label: 'Categories', Icon: TagOutlined, exact: false },
  { href: '/alerts', label: 'Alerts', Icon: AlertOutlined, exact: false },
];

export function TopNav() {
  const styles = useStyles();
  const pathname = usePathname();
  const { user, role } = useAuth();

  return (
    <nav className={styles.topNav}>
      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        <span>📦</span>
        <span>StockFlow</span>
      </Link>

      {/* Nav items */}
      <div className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={mergeClasses(styles.navItem, isActive ? styles.navItemActive : undefined)}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
        <RoleGuard minRole="MANAGER">
          <Link
            href="/team"
            className={mergeClasses(
              styles.navItem,
              pathname === '/team' ? styles.navItemActive : undefined,
            )}
          >
            <TeamOutlined />
            <span>Team</span>
          </Link>
        </RoleGuard>
      </div>

      {/* Right side */}
      <div className={styles.right}>
        <Button
          appearance="transparent"
          icon={<SearchOutlined />}
          className={styles.searchButton}
          aria-label="Search"
        />
        <Menu>
          <MenuTrigger>
            <button className={styles.avatarButton} aria-label={user?.name ?? 'User'}>
              <Avatar name={user?.name ?? 'User'} size={32} />
            </button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuGroup>
                <MenuGroupHeader>
                  <div className={styles.menuHeader}>
                    <Body1Strong>{user?.name ?? 'User'}</Body1Strong>
                    <Caption1 className={styles.menuRole}>{role}</Caption1>
                  </div>
                </MenuGroupHeader>
              </MenuGroup>
              <MenuDivider />
              <MenuItem icon={<LogoutOutlined />}>
                <a href="/auth/logout">Sign out</a>
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </nav>
  );
}
