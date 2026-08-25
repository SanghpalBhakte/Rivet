import React from 'react';
import { SimulationMode } from '../../types/rivet';
import { Card } from '../ui/Card';
import { SkeletonMetric } from '../ui/Skeleton';

interface SummaryColumnProps {
  stages: Array<{ stage: string; count: number }>;
  simMode?: SimulationMode;
}

export const SummaryColumn: React.FC<SummaryColumnProps> = ({
  stages,
  simMode = 'normal',
}) => {
  const totalCount = stages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card title="Pipeline Stage Health" subtitle="Operational distribution across intake stages" dense>
      {simMode === 'loading' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : stages.length === 0 ? (
        <div style={{ padding: '12px 0', color: 'var(--rv-text-muted)', fontSize: '12px', textAlign: 'center' }}>
          No active pipeline stages recorded.
        </div>
      ) : (
        <div className="rv-pipeline-bar-container">
          {stages.map((st) => {
            const count = st.count;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            const hasVolume = count > 0;

            return (
              <div key={st.stage} className="rv-pipeline-item">
                <div className="rv-pipeline-labels">
                  <span style={{ fontWeight: 500, color: hasVolume ? 'var(--rv-text-primary)' : 'var(--rv-text-muted)' }}>
                    {st.stage}
                  </span>
                  <span className="rv-num" style={{ fontWeight: 600, color: hasVolume ? 'var(--rv-text-primary)' : 'var(--rv-text-dim)' }}>
                    {count} <span style={{ fontSize: '10px', color: 'var(--rv-text-dim)', fontWeight: 400 }}>({percentage}%)</span>
                  </span>
                </div>

                <div className="rv-pipeline-track">
                  <div
                    className="rv-pipeline-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: hasVolume ? 'var(--rv-brand)' : 'transparent',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
