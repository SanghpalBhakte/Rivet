import React, { useState, useEffect } from 'react';
import { INITIAL_QUEUE_ITEMS } from '../../data/mockData';
import { QueueItem, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { TodayQueue } from './TodayQueue';
import { TodayReminders } from './TodayReminders';
import { SummaryColumn } from './SummaryColumn';
import { RecentActivity } from './RecentActivity';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ApiService, ActivityLogEntry, DEV_WORKSPACE_ID } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId || DEV_WORKSPACE_ID;

  const [queueItems, setQueueItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live DB state
  const [metrics, setMetrics] = useState<Array<{
    id: string; label: string; value: string | number; subtext: string; urgent: boolean;
  }>>([]);
  const [pipelineStages, setPipelineStages] = useState<Array<{ stage: string; count: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiService.getDashboardMetrics(workspaceId),
      ApiService.getActivityLog(workspaceId, undefined, 12),
    ])
      .then(([dashboard, activity]) => {
        setMetrics(dashboard.metrics);
        setPipelineStages(dashboard.pipelineStages);
        setRecentActivity(activity);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const handleActionComplete = (id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetData = () => {
    setQueueItems(INITIAL_QUEUE_ITEMS);
    setSimMode('normal');
    setErrorMessage(null);
  };

  const handleSimModeChange = (mode: SimulationMode) => {
    setSimMode(mode);
    if (mode === 'error') {
      setErrorMessage('Network connection lost to Janai local server. Retrying background sync...');
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Operations Control Room"
        subline="Janai Ops • Live dispatch, follow-up queues & performance signals"
        simMode={simMode}
        onSimModeChange={handleSimModeChange}
      />

      {(simMode === 'error' || errorMessage) && (
        <div className="rv-error-banner" role="alert" style={{ marginBottom: '20px' }}>
          <div>
            <strong>⚠️ System Sync Warning:</strong> {errorMessage || 'Could not fetch live operations data.'}
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetData}>
            Retry Sync
          </Button>
        </div>
      )}

      {/* Live KPI Metrics Bar */}
      <div className="rv-metrics-grid" style={{ marginBottom: '20px' }}>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="rv-metric-card">
                <div className="rv-skeleton" style={{ width: '40px', height: '28px', marginBottom: '6px' }} />
                <div className="rv-skeleton" style={{ width: '80%', height: '11px', marginBottom: '4px' }} />
                <div className="rv-skeleton" style={{ width: '60%', height: '10px' }} />
              </div>
            ))
          : metrics.map((m) => (
              <div key={m.id} className={`rv-metric-card ${m.urgent ? 'rv-metric-card--urgent' : ''}`}>
                <div className="rv-metric-card__value rv-num">
                  {simMode === 'empty' ? 0 : m.value}
                </div>
                <div className="rv-metric-card__label">{m.label}</div>
                <div className="rv-metric-card__subtext">{m.subtext}</div>
              </div>
            ))}
      </div>

      {/* Two-Column Operations Grid */}
      <div className="rv-dashboard-grid">
        <section aria-label="Today's Operational Actions" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TodayQueue
            items={queueItems}
            onActionComplete={handleActionComplete}
            simMode={simMode}
          />
          <TodayReminders simMode={simMode} />
        </section>

        <aside aria-label="Pipeline & Activity Intelligence" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SummaryColumn
            stages={pipelineStages}
            simMode={loading ? 'loading' : simMode}
          />

          <RecentActivity
            activities={recentActivity}
            simMode={loading ? 'loading' : simMode}
          />

          {/* Ops Quick Links */}
          <Card title="Desk Shortcuts" subtitle="Standard operational triggers" dense>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--rv-text-secondary)' }}>System Status</span>
                <span style={{ color: 'var(--rv-status-job-text)', fontWeight: 600 }}>Active • 100%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--rv-text-secondary)' }}>Primary Channel</span>
                <span style={{ color: 'var(--rv-text-primary)' }}>WhatsApp Intake</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--rv-text-secondary)' }}>Assigned Desk</span>
                <span style={{ color: 'var(--rv-text-primary)' }}>Janai Central</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};
