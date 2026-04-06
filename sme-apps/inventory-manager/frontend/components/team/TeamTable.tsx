'use client';
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Avatar,
  Select,
} from '@fluentui/react-components';
import { Delete20Regular } from '@fluentui/react-icons';
import { RoleGuard } from '../shared/RoleGuard';
import type { TeamMember, Role } from '../../hooks/useTeam';

const ROLE_COLORS: Record<Role, 'brand' | 'warning' | 'informative'> = {
  ADMIN: 'brand',
  MANAGER: 'warning',
  STAFF: 'informative',
};

const useStyles = makeStyles({ table: { width: '100%' } });

interface TeamTableProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: Role) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

export function TeamTable({ members, onUpdateRole, onRemove }: TeamTableProps) {
  const styles = useStyles();
  return (
    <Table className={styles.table}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <Avatar name={m.name} />
            </TableCell>
            <TableCell>{m.email}</TableCell>
            <TableCell>
              <RoleGuard minRole="ADMIN" fallback={<Badge color={ROLE_COLORS[m.role]}>{m.role}</Badge>}>
                <Select value={m.role} onChange={(_, d) => onUpdateRole(m.id, d.value as Role)} style={{ width: 120 }}>
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </RoleGuard>
            </TableCell>
            <TableCell>
              <RoleGuard minRole="ADMIN">
                <Button icon={<Delete20Regular />} appearance="subtle" onClick={() => onRemove(m)} />
              </RoleGuard>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
