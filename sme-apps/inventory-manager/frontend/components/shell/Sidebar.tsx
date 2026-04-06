'use client';
import {
  makeStyles,
  tokens,
  Text,
  Body1,
  Body1Strong,
  Caption1,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
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
} from '@fluentui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../shared/RoleGuard';

const useStyles = makeStyles({
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingVerticalM,
  },
  logo: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: tokens.spacingVerticalM,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flex: '1',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
  },
  active: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  footer: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: 'pointer',
  },
  menuHeader: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: '160px',
  },
  menuRole: {
    color: tokens.colorNeutralForeground3,
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
      <div className={styles.logo}>
        <Text weight="bold" size={500}>📦 StockFlow</Text>
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link}${pathname.startsWith(href) ? ` ${styles.active}` : ''}`}
          >
            <Icon />
            <Body1>{label}</Body1>
          </Link>
        ))}
        <RoleGuard minRole="MANAGER">
          <Link
            href="/team"
            className={`${styles.link}${pathname === '/team' ? ` ${styles.active}` : ''}`}
          >
            <People20Regular />
            <Body1>Team</Body1>
          </Link>
        </RoleGuard>
      </nav>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <div className={styles.footer}>
            <Avatar
              name={user?.name ?? 'User'}
              size={36}
              aria-label={user?.name ?? 'User'}
            />
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <div className={styles.menuHeader}>
              <Body1Strong>{user?.name ?? 'User'}</Body1Strong>
              <Caption1 className={styles.menuRole}>{role}</Caption1>
            </div>
            <MenuDivider />
            <MenuItem
              icon={<SignOut20Regular />}
              onClick={() => { window.location.href = '/auth/logout'; }}
            >
              Sign out
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </aside>
  );
}
