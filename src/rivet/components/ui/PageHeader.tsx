import React from 'react';
import { SimulationMode } from '../../types/rivet';

interface PageHeaderProps {
  title: string;
  subline: string;
  simMode: SimulationMode;
  onSimModeChange: (mode: SimulationMode) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subline,
  simMode,
  onSimModeChange,
}) => {
  return (
    <header className="rv-header">
      <div className="rv-header__titles">
        <h1 className="rv-header__title">{title}</h1>
        <p className="rv-header__subline">{subline}</p>
      </div>

      <div className="rv-header__actions">
        {/* Discrete state simulation controls for testing without dominating UI */}
        <div className="rv-dev-controls" title="Development State Simulator">
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Mode:</span>
          <button
            className={`rv-dev-btn ${simMode === 'normal' ? 'rv-dev-btn--active' : ''}`}
            onClick={() => onSimModeChange('normal')}
          >
            Live
          </button>
          <button
            className={`rv-dev-btn ${simMode === 'loading' ? 'rv-dev-btn--active' : ''}`}
            onClick={() => onSimModeChange('loading')}
          >
            Loading
          </button>
          <button
            className={`rv-dev-btn ${simMode === 'empty' ? 'rv-dev-btn--active' : ''}`}
            onClick={() => onSimModeChange('empty')}
          >
            Empty
          </button>
          <button
            className={`rv-dev-btn ${simMode === 'error' ? 'rv-dev-btn--active' : ''}`}
            onClick={() => onSimModeChange('error')}
          >
            Error
          </button>
        </div>
      </div>
    </header>
  );
};
