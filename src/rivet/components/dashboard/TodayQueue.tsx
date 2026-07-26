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
  simMode: SimulationMode;
}

export const TodayQueue: React.FC<TodayQueueProps> = ({
  items,
  onActionComplete,
  simMode,
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
      title="Today's Queue"
      subtitle="Operational priority tasks"
      dense
      className="rv-card--hero"
      headerAction={
        <div className="rv-queue-tabs" role="tablist" aria-label="Filter today's queue">
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
            <span>Jobs</span>
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
      ) : simMode === 'empty' || filteredItems.length === 0 ? (
        <EmptyState
          icon="✓"
          title="All operational tasks cleared"
          description="No pending follow-ups or callbacks in this queue section. All Janai Ops tasks are up to date."
        />
      ) : (
        <ul className="rv-queue-list" role="list">
          {filteredItems.map((item) => (
            <li key={item.id} className="rv-queue-item">
              {/* Item Details */}
              <div className="rv-queue-item__main">
                <div className="rv-queue-item__meta-row">
                  <Badge variant={item.type}>
                    {item.type === 'overdue' ? 'OVERDUE' : item.type === 'callback' ? 'CALLBACK' : 'TODAY JOB'}
                  </Badge>
                  <span className="rv-queue-item__client">{item.clientName}</span>
                  <span className="rv-queue-item__phone rv-tabular">{item.clientPhone}</span>
                </div>
                <h4 className="rv-queue-item__title">{item.title}</h4>
                <div className="rv-queue-item__context">
                  Context: {item.context}
                </div>
              </div>

              {/* Item Due & Primary Action */}
              <div className="rv-queue-item__right">
                <div className="rv-queue-item__due">
                  <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Scheduled
                  </div>
                  <div className="rv-tabular" style={{ fontWeight: 500 }}>
                    {item.dueTime}
                  </div>
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
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
