import React, { useState, useEffect } from 'react';
import { QueueItem, SimulationMode, TaskRecord } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { TodayQueue } from './TodayQueue';
import { TodayReminders } from './TodayReminders';
import { SummaryColumn } from './SummaryColumn';
import { RecentActivity } from './RecentActivity';
import { Card } from '../ui/Card';
import { ApiService, ActivityLogEntry } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  // FIX: workspaceId may be an empty string if the user has no workspace yet.
  // All queries are guarded behind a truthiness check on workspaceId.
  const workspaceId = user?.workspaceId;

  const [metrics, setMetrics] = useState<Array<{
    id: string; label: string; value: string | number; subtext: string; urgent: boolean;
  }>>([]);
  const [pipelineStages, setPipelineStages] = useState<Array<{ stage: string; count: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Do not fire any queries without a real workspace ID.
    // This prevents leaking into DEV_WORKSPACE_ID data for workspace-less users.
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      ApiService.getDashboardMetrics(workspaceId),
      ApiService.getActivityLog(workspaceId, undefined, 12),
      ApiService.getTasks(workspaceId),
    ])
      .then(([dashboard, activity, liveTasks]) => {
        setMetrics(dashboard.metrics);
        setPipelineStages(dashboard.pipelineStages);
        setRecentActivity(activity);
        setTasks(liveTasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const queueItems: QueueItem[] = tasks
    .filter((t) => t.status !== 'Done')
    .map((t) => ({
      id: t.id,
      type: t.status === 'Overdue' ? 'overdue' : t.type === 'Callback' ? 'callback' : 'job',
      title: t.title,
      context: t.notes || `Assigned to ${t.assignee}`,
      clientName: t.linkedEntityName || 'Operations Client',
      clientPhone: 'Contact via Desk',
      dueTime: t.dueDateTime,
      dueDate: 'Today',
      status: 'pending',
      priority: t.priority === 'Critical' ? 'critical' : t.priority === 'High' ? 'high' : 'normal',
      actionLabel: 'Mark Completed',
      actionType: 'note',
    }));

  const handleActionComplete = (id: string) => {
    ApiService.updateTaskStatus(id, 'Done', { id: user?.id, name: user?.fullName, workspaceId })
      .then((updated) => setTasks(updated))
      .catch(console.error);
  };

  // User has a workspace but no data yet
  const isNewWorkspace = !loading && workspaceId && tasks.length === 0 && recentActivity.length === 0;
  // User is authenticated but has no workspace assigned yet
  const needsWorkspace = !loading && !workspaceId;

  return (
    <div>
      <PageHeader
        kicker="Operations Hub"
        title="Control Room"
        subline="Real-time dispatch status, follow-up priority queue, and pipeline telemetry"
      />

      {/* No workspace assigned — prompt workspace creation/join */}
      {needsWorkspace && (
        <div
          style={{
            background: 'var(--rv-bg-surface)',
            border: '1px solid var(--rv-border-default)',
            borderLeft: '4px solid var(--rv-status-overdue-text)',
            borderRadius: 'var(--rv-radius-lg)',
            padding: '18px 22px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-text-primary)', marginBottom: '4px' }}>
            No Workspace Connected
          </div>
          <p style={{ margin: '0', fontSize: '12.5px', color: 'var(--rv-text-secondary)', lineHeight: 1.5 }}>
            Your account is not associated with a workspace yet. Contact your administrator to be added, or create a new workspace from the settings panel.
          </p>
        </div>
      )}

      {/* New workspace — first-use onboarding */}
      {isNewWorkspace && (
        <div
          style={{
            background: 'var(--rv-bg-surface)',
            border: '1px solid var(--rv-brand-border)',
            borderLeft: '4px solid var(--rv-brand)',
            borderRadius: 'var(--rv-radius-lg)',
            padding: '18px 22px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--rv-text-primary)', marginBottom: '4px' }}>
            Workspace Ready for Operations
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: 'var(--rv-text-secondary)', lineHeight: 1.5 }}>
            Your operational database is connected. Capture incoming leads, schedule dispatch jobs, or track client payment balances.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="rv-kicker" style={{ alignSelf: 'center', marginRight: '6px' }}>
              Quick Actions:
            </span>
            <span style={{ fontSize: '12px', color: 'var(--rv-brand)', fontWeight: 500 }}>
              Use the sidebar to create your first Inquiry Quote or Dispatch Job.
            </span>
          </div>
        </div>
      )}

      {/* Telemetry KPI Bar — only render when workspace is present */}
      {workspaceId && (
        <div className="rv-telemetry-bar">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="rv-telemetry-item">
                  <div className="rv-skeleton" style={{ width: '45px', height: '24px', marginBottom: '6px' }} />
                  <div className="rv-skeleton" style={{ width: '75%', height: '11px', marginBottom: '4px' }} />
                  <div className="rv-skeleton" style={{ width: '55%', height: '10px' }} />
                </div>
              ))
            : metrics.map((m) => (
                <div key={m.id} className={`rv-telemetry-item ${m.urgent ? 'rv-telemetry-item--urgent' : ''}`}>
                  <div className="rv-telemetry-item__value rv-num">
                    {m.value}
                  </div>
                  <div className="rv-telemetry-item__label">{m.label}</div>
                  <div className="rv-telemetry-item__subtext">{m.subtext}</div>
                </div>
              ))}
        </div>
      )}

      {/* Two-Column Operations Layout — only when workspace is connected */}
      {workspaceId && (
        <div className="rv-dashboard-grid">
          <section aria-label="Today's Operational Actions" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TodayQueue
              items={queueItems}
              onActionComplete={handleActionComplete}
              simMode="normal"
            />
            <TodayReminders tasks={tasks} simMode="normal" />
          </section>

          <aside aria-label="Pipeline & Activity Timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SummaryColumn
              stages={pipelineStages}
              simMode={loading ? 'loading' : 'normal'}
            />

            <RecentActivity
              activities={recentActivity}
              simMode={loading ? 'loading' : 'normal'}
            />

            <Card title="Desk Connectivity" subtitle="Service infrastructure signals" dense>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--rv-text-muted)' }}>Database Sync</span>
                  <span style={{ color: 'var(--rv-status-completed-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="rv-status-dot" style={{ width: '5px', height: '5px' }} />
                    Operational
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--rv-text-muted)' }}>Primary Intake</span>
                  <span style={{ color: 'var(--rv-text-primary)' }}>WhatsApp + Webhook</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--rv-text-muted)' }}>Operations Node</span>
                  <span className="rv-mono" style={{ color: 'var(--rv-text-secondary)', fontSize: '11px' }}>Central-HQ-01</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
};
