'use client';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Layout.Content style={{ overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
