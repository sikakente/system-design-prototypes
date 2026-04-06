'use client';
import { ConfigProvider } from 'antd';

export function FluentWrapper({ children }: { children: React.ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}
