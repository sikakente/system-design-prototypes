import { Empty, Button } from 'antd';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Empty
      description={
        <span>
          <strong>{title}</strong>
          {description && <><br /><span style={{ fontSize: 13, color: '#8c8c8c' }}>{description}</span></>}
        </span>
      }
    >
      {action && <Button type="primary" onClick={action.onClick}>{action.label}</Button>}
    </Empty>
  );
}
