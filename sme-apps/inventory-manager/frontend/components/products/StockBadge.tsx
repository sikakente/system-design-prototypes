import { Tag } from 'antd';

interface StockBadgeProps {
  quantity: number;
  threshold: number;
}

export function StockBadge({ quantity, threshold }: StockBadgeProps) {
  const color = quantity === 0 ? 'error' : quantity <= threshold ? 'warning' : 'success';
  return <Tag color={color}>{quantity}</Tag>;
}
