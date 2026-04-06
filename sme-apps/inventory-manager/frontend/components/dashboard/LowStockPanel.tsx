import { Card, Tag, Typography } from 'antd';
import type { Product } from '../../hooks/useProducts';

const { Text } = Typography;

interface LowStockPanelProps {
  alerts: Product[];
}

export function LowStockPanel({ alerts }: LowStockPanelProps) {
  const isHealthy = alerts.length === 0;
  const visible = alerts.slice(0, 6);

  return (
    <Card
      title={
        <span>
          Low Stock{' '}
          <Tag color={isHealthy ? 'success' : 'error'} style={{ marginLeft: 8 }}>
            {alerts.length}
          </Tag>
        </span>
      }
    >
      {isHealthy ? (
        <Text type="success">✓ All levels healthy</Text>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {visible.map((p) => (
            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{p.name}</Text>
              <Text type="danger" strong style={{ fontSize: 11, flexShrink: 0 }}>{p.quantity} left</Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
