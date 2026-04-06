import { Card, Timeline, Typography } from 'antd';
import type { Product } from '../../hooks/useProducts';

const { Text } = Typography;

interface ActivityFeedProps {
  products: Product[];
}

export function ActivityFeed({ products }: ActivityFeedProps) {
  const recent = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const items = recent.map((p) => ({
    content: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text strong style={{ fontSize: 13, display: 'block' }}>{p.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>qty {p.quantity}</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 10, whiteSpace: 'nowrap', paddingTop: 1 }}>
          {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </div>
    ),
  }));

  return (
    <Card title="Recent Activity">
      {recent.length === 0 ? (
        <Text type="secondary" italic>No recent changes</Text>
      ) : (
        <Timeline items={items} />
      )}
    </Card>
  );
}
