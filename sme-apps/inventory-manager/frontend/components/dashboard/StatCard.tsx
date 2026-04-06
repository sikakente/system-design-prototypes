import React from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  featured?: boolean;
  accent?: 'default' | 'danger';
  animationDelay?: string;
}

export function StatCard({ label, value, icon, featured = false, accent = 'default', animationDelay }: StatCardProps) {
  return (
    <Card
      style={{
        animationDelay,
        animation: 'fadeInUp 0.4s both cubic-bezier(0.16, 1, 0.3, 1)',
        ...(featured ? { background: '#1677ff', borderColor: '#1677ff' } : {}),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: featured ? 'rgba(255,255,255,0.2)' : '#e6f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: featured ? '#fff' : '#1677ff',
          }}
        >
          {icon}
        </div>
        <Statistic
          title={<span style={{ color: featured ? 'rgba(255,255,255,0.8)' : undefined, fontSize: 12 }}>{label}</span>}
          value={value}
          valueStyle={{
            color: featured ? '#fff' : accent === 'danger' ? '#ff4d4f' : undefined,
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1,
          }}
        />
      </div>
    </Card>
  );
}
