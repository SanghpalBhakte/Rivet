import React, { useState } from 'react';
import { TaskRecord, SimulationMode } from '../../types/rivet';
import { INITIAL_TASKS } from '../../data/mockData';
import { Card } from '../ui/Card';
import { TaskItem } from '../ui/TaskItem';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';

interface TodayRemindersProps {
  tasks?: TaskRecord[];
  onTaskAction?: (task: TaskRecord) => void;
  simMode: SimulationMode;
}

export const TodayReminders: React.FC<TodayRemindersProps> = ({
  tasks = INITIAL_TASKS,
  onTaskAction,
  simMode,
}) => {
  const [taskList, setTaskList] = useState<TaskRecord[]>(tasks);
  const [filter, setFilter] = useState<'pending' | 'overdue' | 'all'>('pending');

  const handleStatusChange = (task: TaskRecord, newStatus: TaskRecord['status']) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
  };

  const handleActionClick = (task: TaskRecord) => {
    if (onTaskAction) {
      onTaskAction(task);
    }
  };

  // Sort tasks: Overdue > Due Soon > Open > Done, then Critical > High > Normal
  const sortedTasks = [...taskList].sort((a, b) => {
    const statusOrder: Record<TaskRecord['status'], number> = {
      Overdue: 0,
      'Due Soon': 1,
      Open: 2,
      Done: 3,
    };
    const priorityOrder: Record<TaskRecord['priority'], number> = {
      Critical: 0,
      High: 1,
      Normal: 2,
    };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (filter === 'pending') return t.status !== 'Done';
    if (filter === 'overdue') return t.status === 'Overdue';
    return true;
  });

  const pendingCount = taskList.filter((t) => t.status !== 'Done').length;
  const overdueCount = taskList.filter((t) => t.status === 'Overdue').length;

  return (
    <Card
      title="Today's Ops Reminders"
      subtitle="Follow-ups & task reminders across Leads, Jobs & Payments"
      dense
      className="rv-card--hero"
      headerAction={
        <div className="rv-queue-tabs" role="tablist" aria-label="Filter ops reminders">
          <button
            className={`rv-queue-tab ${filter === 'pending' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('pending')}
            role="tab"
            aria-selected={filter === 'pending'}
          >
            <span>Pending</span>
            <span className="rv-queue-tab__count rv-num">{pendingCount}</span>
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
            className={`rv-queue-tab ${filter === 'all' ? 'rv-queue-tab--active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            <span>All</span>
            <span className="rv-queue-tab__count rv-num">{taskList.length}</span>
          </button>
        </div>
      }
    >
      {simMode === 'loading' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : simMode === 'empty' || filteredTasks.length === 0 ? (
        <EmptyState
          icon="✓"
          title="No operational reminders pending"
          description="All callback follow-ups, quote checks, and payment reminders are up to date."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onActionClick={handleActionClick}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
