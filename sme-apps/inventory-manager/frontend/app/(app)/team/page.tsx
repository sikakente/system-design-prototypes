"use client";
import {
  Spinner,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
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

  if (isLoading) return <Spinner label="Loading team..." />;
  if (error)
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load team</MessageBarBody>
      </MessageBar>
    );

  return (
    <div
      style={{
        padding: '28px 32px',
        backgroundColor: 'var(--p-bg)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <MessageBar intent="info">
        <MessageBarBody>
          Role changes take effect on the user&apos;s next login.
        </MessageBarBody>
      </MessageBar>
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
