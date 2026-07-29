import React, { useState } from 'react';
import {
  INITIAL_QUEUE_ITEMS,
  INITIAL_SUMMARY_METRICS,
  INITIAL_RECENT_ACTIVITIES,
} from '../../data/mockData';
import { QueueItem, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { TodayQueue } from './TodayQueue';
import { TodayReminders } from './TodayReminders';
import { SummaryColumn } from './SummaryColumn';
import { RecentActivity } from './RecentActivity';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const DashboardView: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Complete an operational task in the queue
  const handleActionComplete = (id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset state back to initial mock data
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
      {/* Clean Operations Control Room Page Header */}
      <PageHeader
        title="Operations Control Room"
        subline="Janai Ops • Live dispatch, follow-up queues & performance signals"
        simMode={simMode}
        onSimModeChange={handleSimModeChange}
      />

      {/* Error state banner if triggered */}
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

      {/* Balanced 4-Metric Summary Bar */}
      <div className="rv-metrics-grid" style={{ marginBottom: '20px' }}>
        {INITIAL_SUMMARY_METRICS.map((m) => (
          <div key={m.id} className={`rv-metric-card ${m.urgent ? 'rv-metric-card--urgent' : ''}`}>
            <div className="rv-metric-card__value rv-num">
              {simMode === 'empty' ? 0 : m.value}
            </div>
            <div className="rv-metric-card__label">{m.label}</div>
            <div className="rv-metric-card__subtext">{m.subtext}</div>
          </div>
        ))}
      </div>

      {/* Two-Column Balanced Operations Grid */}
      <div className="rv-dashboard-grid">
        {/* Left Primary Column: Priority Queue & Ops Reminders */}
        <section aria-label="Today's Operational Actions" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TodayQueue
            items={queueItems}
            onActionComplete={handleActionComplete}
            simMode={simMode}
          />

          <TodayReminders
            simMode={simMode}
          />
        </section>

        {/* Right Secondary Column: Pipeline Summary, Activity & Quick Controls */}
        <aside aria-label="Pipeline & Activity Intelligence" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SummaryColumn
            metrics={INITIAL_SUMMARY_METRICS}
            simMode={simMode}
          />

          <RecentActivity
            activities={INITIAL_RECENT_ACTIVITIES}
            simMode={simMode}
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

