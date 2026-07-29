import React, { useState } from 'react';
import {
  INITIAL_QUEUE_ITEMS,
  INITIAL_SUMMARY_METRICS,
  INITIAL_PIPELINE_STAGES,
  INITIAL_RECENT_ACTIVITIES,
} from '../../data/mockData';
import { QueueItem, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { PipelineStrip } from '../ui/PipelineStrip';
import { TodayQueue } from './TodayQueue';
import { TodayReminders } from './TodayReminders';
import { SummaryColumn } from './SummaryColumn';
import { RecentActivity } from './RecentActivity';
import { Button } from '../ui/Button';

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
      {/* Clean Page Header with title and short operational subline */}
      <PageHeader
        title="Operations Control Room"
        subline="Janai Tours & Service Ops • Monday, Jul 27 • Operational items & reminders"
        simMode={simMode}
        onSimModeChange={handleSimModeChange}
      />

      {/* Error state banner if triggered */}
      {(simMode === 'error' || errorMessage) && (
        <div className="rv-error-banner" role="alert">
          <div>
            <strong>⚠️ System Sync Warning:</strong> {errorMessage || 'Could not fetch live operations data.'}
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetData}>
            Retry Sync
          </Button>
        </div>
      )}

      {/* Pipeline stage counter strip */}
      <PipelineStrip stages={INITIAL_PIPELINE_STAGES} simMode={simMode} />

      {/* Dashboard Grid: Main Hero (Today's Queue + Today's Reminders) + Secondary Summary Column */}
      <div className="rv-dashboard-grid">
        {/* Main Hero Section */}
        <section aria-label="Today's Operational Queue and Reminders" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TodayQueue
            items={queueItems}
            onActionComplete={handleActionComplete}
            simMode={simMode}
          />

          <TodayReminders
            simMode={simMode}
          />
        </section>

        {/* Secondary Compact Summary Column */}
        <SummaryColumn
          metrics={INITIAL_SUMMARY_METRICS}
          simMode={simMode}
        />
      </div>

      {/* Quiet Recent Activity Section */}
      <RecentActivity
        activities={INITIAL_RECENT_ACTIVITIES}
        simMode={simMode}
      />
    </div>
  );
};
