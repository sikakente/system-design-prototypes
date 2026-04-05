import { auth0 } from '../../lib/auth0';
import { redirect } from 'next/navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppShell } from '../../components/shell/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();
  if (!session) redirect('/login');

  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
