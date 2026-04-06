'use client';
import { Table, Avatar, Select, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { TeamMember, Role } from '../../hooks/useTeam';

interface TeamTableProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

const ROLES: Role[] = ['STAFF', 'MANAGER', 'ADMIN'];

export function TeamTable({ members, onUpdateRole, onRemove }: TeamTableProps) {
  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Member',
      key: 'name',
      render: (_, m) => (
        <Space>
          <Avatar size={32}>{(m.name ?? m.email)[0].toUpperCase()}</Avatar>
          <span style={{ fontWeight: 500 }}>{m.name ?? '—'}</span>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      key: 'role',
      render: (_, m) => (
        <RoleGuard
          minRole="MANAGER"
          fallback={<span>{m.role}</span>}
        >
          <Select
            value={m.role}
            onChange={(val) => onUpdateRole(m.id, val)}
            options={ROLES.map((r) => ({ value: r, label: r }))}
            size="small"
            style={{ width: 120 }}
          />
        </RoleGuard>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, m) => (
        <RoleGuard minRole="MANAGER">
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => onRemove(m)} />
        </RoleGuard>
      ),
    },
  ];

  return <Table columns={columns} dataSource={members} rowKey="id" pagination={false} />;
}
