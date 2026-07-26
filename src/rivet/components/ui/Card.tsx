import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  dense = false,
}) => {
  return (
    <div className={`rv-card ${className}`}>
      {(title || headerAction) && (
        <div className="rv-card__header">
          <div className="rv-card__title-group">
            {title && <h3 className="rv-card__title">{title}</h3>}
            {subtitle && <span className="rv-card__subtitle">{subtitle}</span>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={`rv-card__body ${dense ? 'rv-card__body--dense' : ''}`}>
        {children}
      </div>
    </div>
  );
};
