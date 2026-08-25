import React, { useState } from 'react';
import { QueueItem, QueueItemType, SimulationMode } from '../../types/rivet';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';

interface TodayQueueProps {
  items: QueueItem[];
  onActionComplete: (id: string) => void;
  simMode?: SimulationMode;
}

export const TodayQueue: React.FC<TodayQueueProps> = ({
  items,
  onActionComplete,
  simMode = 'normal',
}) => {
  const [filter, setFilter] = useState<'all' | QueueItemType>('all');

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const overdueCount = items.filter((i) => i.type === 'overdue').length;
  const callbackCount = items.filter((i) => i.type === 'callback').length;
  const jobCount = items.filter((i) => i.type === 'job').length;

  return (
    <Card
      title="Action Queue"
      subtitle="Immediate operational priorities"
      dense
      headerAction={
        <div className="rv-queue-tabs" role="tablist" aria-label="Filter action queue">
          <button
            className={`rv-queue-tab ${filter === 'all' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            <span>All</span>
            <span className="rv-queue-tab__count rv-num">{items.length}</span>
          </button>

          <button
            className={`rv-queue-tab ${filter === 'overdue' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('overdue')}
            role="tab"
            aria-selected={filter === 'overdue'}
          >
            <span style={{ color: overdueCount > 0 ? 'var(--rv-status-overdue-text)' : undefined }}>
              Overdue
            </span>
            <span className="rv-queue-tab__count rv-num">{overdueCount}</span>
          </button>

          <button
            className={`rv-queue-tab ${filter === 'callback' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('callback')}
            role="tab"
            aria-selected={filter === 'callback'}
          >
            <span>Callbacks</span>
            <span className="rv-queue-tab__count rv-num">{callbackCount}</span>
          </button>

          <button
            className={`rv-queue-tab ${filter === 'job' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('job')}
            role="tab"
            aria-selected={filter === 'job'}
          >
            <span>Dispatches</span>
            <span className="rv-queue-tab__count rv-num">{jobCount}</span>
          </button>
        </div>
      }
    >
      {simMode === 'loading' ? (
        <div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="✓"
          title="All Action Items Cleared"
          description="No pending items in this queue category. Active dispatches and reminders will surface here as scheduled."
        />
      ) : (
        <div className="rv-queue-container" role="list">
          {filteredItems.map((item) => (
            <div key={item.id} className="rv-queue-row">
              <div className="rv-queue-row__main">
                <div className="rv-queue-row__header">
                  <Badge variant={item.type}>
                    {item.type === 'overdue' ? 'Overdue' : item.type === 'callback' ? 'Callback' : 'Dispatch'}
                  </Badge>
                  <span className="rv-queue-row__client">{item.clientName}</span>
                </div>
                <div className="rv-queue-row__title">
                  {item.title}
                </div>
                <div className="rv-queue-row__context">
                  <span>{item.context}</span>
                </div>
              </div>

              <div className="rv-queue-row__meta">
                <div className="rv-queue-row__time">
                  <div className="rv-kicker" style={{ fontSize: '10px' }}>Due</div>
                  <div className="rv-num" style={{ fontWeight: 500, color: 'var(--rv-text-secondary)' }}>{item.dueTime}</div>
                </div>

                <Button
                  variant={item.type === 'overdue' ? 'overdue' : 'secondary'}
                  size="sm"
                  onClick={() => onActionComplete(item.id)}
                  aria-label={`${item.actionLabel} for ${item.clientName}`}
                >
                  {item.actionLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
