"use client";
import { Spin, Alert } from "antd";
import { TeamTable } from "../../../components/team/TeamTable";
import { EmptyState } from "../../../components/shared/EmptyState";
import {
  useTeam,
  updateMember,
  deleteMember,
  type Role,
} from "../../../hooks/useTeam";
import { mutate } from "swr";

export default function TeamPage() {
  const { data: members, isLoading, error } = useTeam();

  const handleUpdateRole = async (id: string, newRole: Role) => {
    await updateMember(id, { role: newRole });
    mutate("/users");
  };

  const handleRemove = async (member: { id: string }) => {
    await deleteMember(member.id);
    mutate("/users");
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '28px 32px' }}>
      <Spin />
    </div>
  );
  if (error) return <Alert type="error" title="Failed to load team" showIcon />;

  return (
    <div style={{ padding: '28px 32px', background: '#f5f5f5', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" title="Role changes take effect on the user's next login." showIcon style={{ marginBottom: 16 }} />
      {(members ?? []).length === 0 ? (
        <EmptyState
          title="No team members"
          description="Invite people to join your team."
        />
      ) : (
        <TeamTable
          members={members ?? []}
          onUpdateRole={handleUpdateRole}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}
