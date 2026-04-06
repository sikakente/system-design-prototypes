'use client';
import { Button, Avatar, Select } from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { TeamMember, Role } from '../../hooks/useTeam';

interface TeamTableProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--p-text-3)',
  borderBottom: '1px solid var(--p-border)',
  backgroundColor: '#F8FAFC',
  textAlign: 'left' as const,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '13px',
  color: 'var(--p-text)',
  borderBottom: '1px solid var(--p-border)',
};

const tdLastStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '13px',
  color: 'var(--p-text)',
};

export function TeamTable({ members, onUpdateRole, onRemove }: TeamTableProps) {
  return (
    <div style={{ backgroundColor: 'var(--p-card)', border: '1px solid var(--p-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--p-shadow)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-sans)' }}>
        <thead>
          <tr>
            <th style={thStyle}>Member</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, index) => {
            const isLast = index === members.length - 1;
            const cellStyle = isLast ? tdLastStyle : tdStyle;
            return (
              <tr key={m.id}>
                <td style={cellStyle}>
                  <Avatar name={m.name} />
                </td>
                <td style={cellStyle}>{m.email}</td>
                <td style={cellStyle}>
                  <RoleGuard
                    minRole="ADMIN"
                    fallback={
                      <span style={{ backgroundColor: 'var(--p-primary-50)', color: 'var(--p-primary)', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                        {m.role}
                      </span>
                    }
                  >
                    <Select
                      value={m.role}
                      onChange={(_, d) => onUpdateRole(m.id, d.value as Role)}
                      style={{ backgroundColor: 'white', border: '1px solid var(--p-border)', borderRadius: '6px', color: 'var(--p-text)', fontFamily: 'var(--p-sans)' }}
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </Select>
                  </RoleGuard>
                </td>
                <td style={cellStyle}>
                  <RoleGuard minRole="ADMIN">
                    <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onRemove(m)} />
                  </RoleGuard>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
