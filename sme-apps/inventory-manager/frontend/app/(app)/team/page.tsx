'use client';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { redirect } from 'next/navigation';
import { Header } from '../../../components/shell/Header';
import { TeamTable } from '../../../components/team/TeamTable';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useTeam, updateMember, deleteMember, type Role } from '../../../hooks/useTeam';
import { useAuth } from '../../../contexts/AuthContext';
import { mutate } from 'swr';

export default function TeamPage() {
  const { role } = useAuth();
  const { data: members, isLoading, error } = useTeam();

  if (role === 'STAFF') redirect('/dashboard');

  const handleUpdateRole = async (id: string, newRole: Role) => {
    await updateMember(id, { role: newRole });
    mutate('/users');
  };

  const handleRemove = async (member: { id: string }) => {
    await deleteMember(member.id);
    mutate('/users');
  };

  if (isLoading) return <Spinner label="Loading team..." />;
  if (error) return <MessageBar intent="error"><MessageBarBody>Failed to load team</MessageBarBody></MessageBar>;

  return (
    <>
      <Header title="Team" />
      <div style={{ padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
        <MessageBar intent="info">
          <MessageBarBody>Role changes take effect on the user's next login.</MessageBarBody>
        </MessageBar>
        {(members ?? []).length === 0 ? (
          <EmptyState title="No team members" description="Invite people to join your team." />
        ) : (
          <TeamTable
            members={members ?? []}
            onUpdateRole={handleUpdateRole}
            onRemove={handleRemove}
          />
        )}
      </div>
    </>
  );
}
