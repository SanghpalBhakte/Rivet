import React from 'react';
import { TaskRecord, TaskStatus } from '../../types/rivet';
import { Badge } from './Badge';
import { Button } from './Button';

interface TaskItemProps {
  task: TaskRecord;
  onSelect?: (task: TaskRecord) => void;
  onActionClick?: (task: TaskRecord) => void;
  onStatusChange?: (task: TaskRecord, newStatus: TaskStatus) => void;
  onSnooze?: (task: TaskRecord) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onSelect,
  onActionClick,
  onStatusChange,
  onSnooze,
}) => {
  const getStatusVariant = (status: TaskRecord['status']) => {
    switch (status) {
      case 'Done': return 'completed';
      case 'Due Soon': return 'callback';
      case 'Overdue': return 'overdue';
      case 'Open': default: return 'neutral';
    }
  };

  const getPriorityBorder = (priority: TaskRecord['priority']) => {
    switch (priority) {
      case 'Critical': return 'var(--rv-status-overdue-text)';
      case 'High': return 'var(--rv-accent-sky)';
      case 'Normal': default: return 'transparent';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(task)}
      style={{
        backgroundColor: 'var(--rv-bg-surface)',
        border: '1px solid var(--rv-border-subtle)',
        borderLeft: `3px solid ${getPriorityBorder(task.priority)}`,
        borderRadius: 'var(--rv-radius-md)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'background-color 0.12s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
            <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 500 }}>
              {task.type}
            </span>
            {task.linkedEntityName && (
              <span style={{ fontSize: '11px', color: 'var(--rv-text-secondary)' }}>
                • {task.linkedEntityType}: <strong style={{ color: 'var(--rv-text-primary)' }}>{task.linkedEntityName}</strong>
              </span>
            )}
          </div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--rv-text-primary)' }}>
            {task.title}
          </h4>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 500, color: task.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-secondary)' }}>
            {task.dueDateTime}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--rv-text-dim)', marginTop: '1px' }}>
            {task.assignee}
          </div>
        </div>
      </div>

      {(task.notes || onActionClick || onStatusChange || onSnooze) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--rv-text-muted)', flex: 1, minWidth: '180px' }}>
            {task.notes && <span>{task.notes}</span>}
          </div>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onSnooze && task.status !== 'Done' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(task);
                }}
                title="Snooze Task"
              >
                ⏰ Snooze
              </Button>
            )}
            {task.status !== 'Done' && onStatusChange && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task, 'Done');
                }}
              >
                ✓ Mark Done
              </Button>
            )}
            {task.status === 'Done' && onStatusChange && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task, 'Open');
                }}
              >
                🔄 Reopen
              </Button>
            )}
            {onActionClick && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick(task);
                }}
              >
                View {task.linkedEntityType || 'Record'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
