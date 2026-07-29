import React from 'react';
import { SimulationMode } from '../../types/rivet';
import { Card } from '../ui/Card';
import { ActivityLogEntry } from '../../services/api';

interface RecentActivityProps {
  activities: ActivityLogEntry[];
  simMode: SimulationMode;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  simMode,
}) => {
  return (
    <div className="rv-activity-section">
      <Card title="Recent Activity" subtitle="Live chronological operations log">
        {simMode === 'loading' ? (
          <div style={{ padding: '8px 0' }}>
            <div className="rv-skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
            <div className="rv-skeleton" style={{ width: '85%', height: '14px', marginBottom: '8px' }} />
            <div className="rv-skeleton" style={{ width: '90%', height: '14px' }} />
          </div>
        ) : simMode === 'empty' || activities.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--rv-text-muted)', fontSize: '12px', textAlign: 'center' }}>
            No recent activity recorded yet. Actions on leads, jobs, tasks, and payments will appear here.
          </div>
        ) : (
          <ul className="rv-activity-list" role="list">
            {activities.map((act) => (
              <li key={act.id} className="rv-activity-item">
                <span className="rv-activity-dot" aria-hidden="true" />
                <span className="rv-activity-time rv-tabular">{act.createdAt}</span>
                <div className="rv-activity-desc">
                  <strong style={{ color: 'var(--rv-text-primary)', fontWeight: 600 }}>
                    {act.title}:{' '}
                  </strong>
                  {act.description}
                  {act.actorName && (
                    <span style={{ color: 'var(--rv-text-muted)', fontSize: '10px', display: 'block', marginTop: '1px' }}>
                      by {act.actorName}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
