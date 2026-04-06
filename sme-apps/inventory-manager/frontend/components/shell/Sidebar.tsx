'use client';
import {
  makeStyles,
  mergeClasses,
  tokens,
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
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
  },
  companySection: {
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
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
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: tokens.fontFamilyBase,
    lineHeight: '1.3',
  },
  companyName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: '1.3',
  },
  chevron: {
    color: tokens.colorNeutralForeground2,
    marginLeft: 'auto',
  },
  menuLabel: {
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.1em',
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    fontFamily: tokens.fontFamilyBase,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    flex: '1',
  },
  link: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    textDecoration: 'none',
    fontFamily: tokens.fontFamilyBase,
  },
  linkActive: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: tokens.borderRadiusMedium,
  },
  iconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: tokens.colorNeutralForegroundOnBrand,
  },
  userMenu: {
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  avatarTrigger: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
  },
  userName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: '1.3',
  },
  userRole: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: '1.3',
  },
  userTextStack: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  menuHeader: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  menuRole: {
    color: tokens.colorNeutralForeground2,
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
                  <span className={styles.menuRole} style={{ fontSize: '12px' }}>{role}</span>
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
