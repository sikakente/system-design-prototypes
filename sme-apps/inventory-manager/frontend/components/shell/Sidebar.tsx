'use client';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import type { MenuProps, GetProp } from 'antd';
import Link from 'next/link';

type MenuItem = GetProp<MenuProps, 'items'>[number];
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home20Regular,
  Box20Regular,
  Tag20Regular,
  Alert20Regular,
  People20Regular,
  SignOut20Regular,
  ChevronDown20Regular,
} from '@fluentui/react-icons';

const { Sider } = Layout;
const { Text } = Typography;

const ROLE_RANK: Record<string, number> = { STAFF: 0, MANAGER: 1, ADMIN: 2 };

const BASE_NAV: MenuItem[] = [
  { key: '/dashboard', icon: <Home20Regular />, label: <Link href="/dashboard">Dashboard</Link> },
  { key: '/products', icon: <Box20Regular />, label: <Link href="/products">Products</Link> },
  { key: '/categories', icon: <Tag20Regular />, label: <Link href="/categories">Categories</Link> },
  { key: '/alerts', icon: <Alert20Regular />, label: <Link href="/alerts">Reorder Alerts</Link> },
];

const TEAM_ITEM: MenuItem = {
  key: '/team',
  icon: <People20Regular />,
  label: <Link href="/team">Team</Link>,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const selectedKey =
    ['/dashboard', '/products', '/categories', '/alerts', '/team'].find((path) =>
      pathname.startsWith(path)
    ) ?? '/dashboard';

  const navItems: MenuItem[] = [
    ...BASE_NAV,
    ...(ROLE_RANK[role] >= ROLE_RANK['MANAGER'] ? [TEAM_ITEM] : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: <Text strong>{user?.name ?? 'User'}</Text>,
      children: [
        { key: 'role', label: <Text type="secondary">{role}</Text>, disabled: true },
      ],
    },
    { type: 'divider' },
    {
      key: 'signout',
      icon: <SignOut20Regular />,
      label: <a href="/auth/logout">Sign out</a>,
    },
  ];

  return (
    <Sider
      width={240}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Company logo / brand */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: 16 }}>
          📦 StockFlow
        </Text>
      </div>

      {/* Nav menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ flex: 1, borderRight: 0 }}
        items={navItems}
      />

      {/* User menu at bottom */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          marginTop: 'auto',
        }}
      >
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="topLeft">
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 6,
            }}
          >
            <Avatar size={32}>{(user?.name ?? 'U')[0].toUpperCase()}</Avatar>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.3 }}>{role}</div>
            </div>
            <ChevronDown20Regular />
          </button>
        </Dropdown>
      </div>
    </Sider>
  );
}
