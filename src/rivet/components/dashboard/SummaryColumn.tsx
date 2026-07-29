import React from 'react';
import { SimulationMode } from '../../types/rivet';
import { Card } from '../ui/Card';
import { SkeletonMetric } from '../ui/Skeleton';

interface SummaryColumnProps {
  stages: Array<{ stage: string; count: number }>;
  simMode: SimulationMode;
}

export const SummaryColumn: React.FC<SummaryColumnProps> = ({
  stages,
  simMode,
}) => {
  const totalCount = simMode === 'empty' ? 0 : stages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card title="Pipeline Stage Distribution" subtitle="Active operational volume across stages" dense>
      {simMode === 'loading' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stages.map((st) => {
            const count = simMode === 'empty' ? 0 : st.count;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            const hasVolume = count > 0;

            return (
              <div key={st.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: hasVolume ? 'var(--rv-status-callback-text)' : 'var(--rv-text-dim)',
                      }}
                    />
                    <span style={{ fontWeight: 500, color: hasVolume ? 'var(--rv-text-primary)' : 'var(--rv-text-muted)' }}>
                      {st.stage}
                    </span>
                  </div>
                  <div className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: hasVolume ? 'var(--rv-text-primary)' : 'var(--rv-text-dim)' }}>
                    {count} <span style={{ fontSize: '10px', color: 'var(--rv-text-dim)', fontWeight: 400 }}>({percentage}%)</span>
                  </div>
                </div>

                {/* Micro progress bar */}
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: 'var(--rv-bg-input)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: hasVolume ? 'var(--rv-status-callback-text)' : 'transparent',
                      transition: 'width 0.2s ease',
                      opacity: 0.85,
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

