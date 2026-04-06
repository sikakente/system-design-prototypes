'use client';
import { Typography } from 'antd';

const { Title } = Typography;

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <div
      style={{
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
