import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = '✓',
  style,
}) => {
  return (
    <div className="rv-empty-state" role="status" style={style}>
      <div className="rv-empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h4 className="rv-empty-state__title">{title}</h4>
      <p className="rv-empty-state__description">{description}</p>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
};
