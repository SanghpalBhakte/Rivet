import React from 'react';
import { SummaryMetric, PipelineStage, SimulationMode } from '../../types/rivet';
import { INITIAL_PIPELINE_STAGES } from '../../data/mockData';
import { SkeletonMetric } from '../ui/Skeleton';

interface SummaryColumnProps {
  metrics: SummaryMetric[];
  stages?: PipelineStage[];
  simMode: SimulationMode;
}

export const SummaryColumn: React.FC<SummaryColumnProps> = ({
  metrics,
  stages = INITIAL_PIPELINE_STAGES,
  simMode,
}) => {
  return (
    <aside className="rv-summary-card" aria-label="Operational Summary & Pipeline Health">
      <div className="rv-summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Pipeline Health</span>
        <span style={{ fontSize: '10px', color: 'var(--rv-text-dim)', textTransform: 'none', fontWeight: 500 }}>Live Active Stages</span>
      </div>

      {simMode === 'loading' ? (
        <div>
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : (
        <div className="rv-summary-list">
          {stages.map((st) => (
            <div key={st.stage} className="rv-summary-row" style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.count > 0 ? 'var(--rv-status-callback-text)' : 'var(--rv-text-dim)' }} />
                <span className="rv-summary-label" style={{ fontSize: '12px', fontWeight: 500 }}>{st.stage}</span>
              </div>
              <span className="rv-summary-val rv-num" style={{ fontSize: '13px', fontWeight: 600, color: st.count > 0 ? 'var(--rv-text-primary)' : 'var(--rv-text-muted)' }}>
                {simMode === 'empty' ? 0 : st.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
