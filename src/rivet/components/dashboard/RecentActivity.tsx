import React from 'react';
import { SimulationMode } from '../../types/rivet';
import { Card } from '../ui/Card';
import { ActivityLogEntry } from '../../services/api';

interface RecentActivityProps {
  activities: ActivityLogEntry[];
  simMode?: SimulationMode;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  simMode = 'normal',
}) => {
  return (
    <Card title="Activity Timeline" subtitle="Live chronological audit log" dense>
      {simMode === 'loading' ? (
        <div style={{ padding: '8px 0' }}>
          <div className="rv-skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
          <div className="rv-skeleton" style={{ width: '85%', height: '14px', marginBottom: '8px' }} />
          <div className="rv-skeleton" style={{ width: '90%', height: '14px' }} />
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '16px 0', color: 'var(--rv-text-muted)', fontSize: '12px', textAlign: 'center' }}>
          No recent activity recorded yet. Actions on leads, jobs, tasks, and payments will appear here.
        </div>
      ) : (
        <div className="rv-timeline">
          {activities.map((act) => (
            <div key={act.id} className="rv-timeline-item">
              <div className="rv-timeline-dot" aria-hidden="true" />
              <div className="rv-timeline-content">
                <div className="rv-timeline-title">
                  {act.title}
                </div>
                <div className="rv-timeline-desc">
                  {act.description}
                </div>
                <div className="rv-timeline-time">
                  {act.createdAt} {act.actorName && `• by ${act.actorName}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
