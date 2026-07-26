import React from 'react';
import { QueueItemType } from '../../types/rivet';

interface BadgeProps {
  children: React.ReactNode;
  variant?: QueueItemType | 'completed' | 'neutral' | 'stage';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  let badgeClass = 'rv-badge--neutral';

  switch (variant) {
    case 'overdue':
      badgeClass = 'rv-badge--overdue';
      break;
    case 'callback':
      badgeClass = 'rv-badge--callback';
      break;
    case 'job':
      badgeClass = 'rv-badge--job';
      break;
    case 'completed':
      badgeClass = 'rv-badge--completed';
      break;
    default:
      badgeClass = 'rv-badge--neutral';
  }

  return (
    <span className={`rv-badge ${badgeClass} ${className}`}>
      {children}
    </span>
  );
};
