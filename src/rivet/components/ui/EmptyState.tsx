import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = '✓',
}) => {
  return (
    <div className="rv-empty-state" role="status">
      <div className="rv-empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h4 className="rv-empty-state__title">{title}</h4>
      <p className="rv-empty-state__desc">{description}</p>
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  );
};
