import { Card, List, Tag, Typography } from 'antd';
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
        <List
          size="small"
          dataSource={visible}
          renderItem={(p) => (
            <List.Item>
              <Text style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{p.name}</Text>
              <Text type="danger" strong style={{ fontSize: 11, flexShrink: 0 }}>{p.quantity} left</Text>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
