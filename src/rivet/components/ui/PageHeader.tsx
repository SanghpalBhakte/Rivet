import React from 'react';
import { SimulationMode } from '../../types/rivet';

interface PageHeaderProps {
  title: string;
  subline?: string;
  kicker?: string;
  action?: React.ReactNode;
  simMode?: SimulationMode;
  onSimModeChange?: (mode: SimulationMode) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subline,
  kicker,
  action,
}) => {
  return (
    <header className="rv-header">
      <div className="rv-header__title-block">
        {kicker && <span className="rv-kicker">{kicker}</span>}
        <h1 className="rv-header__title">{title}</h1>
        {subline && <p className="rv-header__subline">{subline}</p>}
      </div>

      <div className="rv-header__controls">
        <div className="rv-status-indicator" title="System state">
          <span className="rv-status-dot" />
          <span>System Nominal</span>
        </div>
        {action}
      </div>
    </header>
  );
};
