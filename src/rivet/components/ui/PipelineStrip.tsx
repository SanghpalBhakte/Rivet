import React from 'react';
import { PipelineStage, SimulationMode } from '../../types/rivet';

interface PipelineStripProps {
  stages: PipelineStage[];
  simMode?: SimulationMode;
}

export const PipelineStrip: React.FC<PipelineStripProps> = ({
  stages,
  simMode = 'normal',
}) => {
  if (simMode === 'loading') {
    return (
      <div className="rv-pipeline-strip">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="rv-pipeline-item">
            <div className="rv-skeleton" style={{ width: '50px', height: '11px' }} />
            <div className="rv-skeleton" style={{ width: '24px', height: '18px', marginTop: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rv-pipeline-strip" role="region" aria-label="Pipeline stage summary counts">
      {stages.map((st) => (
        <div key={st.stage} className="rv-pipeline-item">
          <span className="rv-pipeline-stage">{st.stage}</span>
          <span className="rv-pipeline-count rv-num">{simMode === 'empty' ? 0 : st.count}</span>
        </div>
      ))}
    </div>
  );
};
