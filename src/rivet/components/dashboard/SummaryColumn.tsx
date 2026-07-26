import React from 'react';
import { SummaryMetric, SimulationMode } from '../../types/rivet';
import { SkeletonMetric } from '../ui/Skeleton';

interface SummaryColumnProps {
  metrics: SummaryMetric[];
  simMode: SimulationMode;
}

export const SummaryColumn: React.FC<SummaryColumnProps> = ({
  metrics,
  simMode,
}) => {
  return (
    <aside className="rv-summary-card" aria-label="Operational Summary Metrics">
      <div className="rv-summary-header">
        Operations Overview
      </div>

      {simMode === 'loading' ? (
        <div>
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : (
        <div className="rv-summary-list">
          {metrics.map((m) => (
            <div key={m.id} className="rv-summary-row">
              <div>
                <div className="rv-summary-label">{m.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>{m.subtext}</div>
              </div>
              <span
                className={`rv-summary-val rv-num ${m.urgent ? 'rv-summary-val--urgent' : ''}`}
              >
                {simMode === 'empty' ? 0 : m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
