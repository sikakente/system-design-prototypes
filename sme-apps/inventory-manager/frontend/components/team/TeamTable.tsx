'use client';
import { makeStyles, tokens, Button, Avatar, Select } from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { TeamMember, Role } from '../../hooks/useTeam';

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'hidden',
    boxShadow: tokens.shadow4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: tokens.fontFamilyBase,
  },
  th: {
    padding: '12px 20px',
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: tokens.colorNeutralForeground3,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    backgroundColor: tokens.colorNeutralBackground3,
    textAlign: 'left',
  },
  td: {
    padding: '14px 20px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
  },
  tdLast: {
    padding: '14px 20px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  roleBadge: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
  },
  select: {
    backgroundColor: 'white',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: '6px',
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
  },
});

interface TeamTableProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

export function TeamTable({ members, onUpdateRole, onRemove }: TeamTableProps) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Member</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, index) => {
            const isLast = index === members.length - 1;
            const cellClass = isLast ? styles.tdLast : styles.td;
            return (
              <tr key={m.id}>
                <td className={cellClass}>
                  <Avatar name={m.name} />
                </td>
                <td className={cellClass}>{m.email}</td>
                <td className={cellClass}>
                  <RoleGuard
                    minRole="ADMIN"
                    fallback={
                      <span className={styles.roleBadge}>{m.role}</span>
                    }
                  >
                    <Select
                      value={m.role}
                      onChange={(_, d) => onUpdateRole(m.id, d.value as Role)}
                      className={styles.select}
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </Select>
                  </RoleGuard>
                </td>
                <td className={cellClass}>
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
