import React from 'react';
import { QueueItemType } from '../../types/rivet';

export type BadgeVariant =
  | QueueItemType
  | 'completed'
  | 'paid'
  | 'scheduled'
  | 'quote'
  | 'stage'
  | 'neutral'
  | 'active'
  | 'pending';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  showDot = true,
  className = '',
  style,
}) => {
  let badgeClass = 'rv-badge--neutral';

  switch (variant) {
    case 'overdue':
      badgeClass = 'rv-badge--overdue';
      break;
    case 'callback':
    case 'quote':
    case 'stage':
      badgeClass = 'rv-badge--callback';
      break;
    case 'job':
    case 'scheduled':
    case 'active':
      badgeClass = 'rv-badge--job';
      break;
    case 'completed':
    case 'paid':
      badgeClass = 'rv-badge--completed';
      break;
    default:
      badgeClass = 'rv-badge--neutral';
  }

  return (
    <span className={`rv-badge ${badgeClass} ${className}`} style={style}>
      {showDot && <span className="rv-badge__dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
