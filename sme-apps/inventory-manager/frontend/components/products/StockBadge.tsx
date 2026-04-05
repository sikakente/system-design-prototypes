import { Badge } from '@fluentui/react-components';

interface StockBadgeProps {
  quantity: number;
  threshold: number;
}

export function StockBadge({ quantity, threshold }: StockBadgeProps) {
  const color =
    quantity === 0 ? 'danger' : quantity <= threshold ? 'warning' : 'success';
  return (
    <Badge color={color} appearance="filled">
      {quantity}
    </Badge>
  );
}
