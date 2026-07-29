import React from 'react';
import { SummaryMetric, PipelineStage, SimulationMode } from '../../types/rivet';
import { INITIAL_PIPELINE_STAGES } from '../../data/mockData';
import { Card } from '../ui/Card';
import { SkeletonMetric } from '../ui/Skeleton';

interface SummaryColumnProps {
  metrics: SummaryMetric[];
  stages?: PipelineStage[];
  simMode: SimulationMode;
}

export const SummaryColumn: React.FC<SummaryColumnProps> = ({
  stages = INITIAL_PIPELINE_STAGES,
  simMode,
}) => {
  return (
    <Card title="Pipeline Health" subtitle="Live active stage summary" dense>
      {simMode === 'loading' ? (
        <div>
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : (
        <div className="rv-summary-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {stages.map((st) => (
            <div key={st.stage} className="rv-summary-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: st.count > 0 ? 'var(--rv-status-callback-text)' : 'var(--rv-text-dim)',
                  }}
                />
                <span className="rv-summary-label" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--rv-text-secondary)' }}>
                  {st.stage}
                </span>
              </div>
              <span
                className="rv-summary-val rv-num"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: st.count > 0 ? 'var(--rv-text-primary)' : 'var(--rv-text-muted)',
                }}
              >
                {simMode === 'empty' ? 0 : st.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
