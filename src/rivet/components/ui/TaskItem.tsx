import React from 'react';
import { TaskRecord } from '../../types/rivet';
import { Badge } from './Badge';
import { Button } from './Button';

interface TaskItemProps {
  task: TaskRecord;
  onActionClick?: (task: TaskRecord) => void;
  onStatusChange?: (task: TaskRecord, newStatus: TaskRecord['status']) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onActionClick, onStatusChange }) => {
  const getStatusVariant = (status: TaskRecord['status']) => {
    switch (status) {
      case 'Done': return 'completed';
      case 'Due Soon': return 'callback';
      case 'Overdue': return 'overdue';
      case 'Open': default: return 'neutral';
    }
  };

  const getPriorityColor = (priority: TaskRecord['priority']) => {
    switch (priority) {
      case 'Critical': return 'var(--rv-status-overdue-text)';
      case 'High': return 'var(--rv-status-callback-text)';
      case 'Normal': default: return 'var(--rv-text-muted)';
    }
  };

  return (
    <div style={{
      background: 'var(--rv-bg-base)',
      border: '1px solid var(--rv-border-default)',
      borderRadius: 'var(--rv-radius-md)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      borderLeft: `3px solid ${getPriorityColor(task.priority)}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant={getStatusVariant(task.status)}>{task.status.toUpperCase()}</Badge>
            <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
              {task.type}
            </span>
            {task.linkedEntityName && (
              <span style={{ fontSize: '11px', color: 'var(--rv-text-secondary)' }}>
                • {task.linkedEntityType}: <strong style={{ color: 'var(--rv-text-primary)' }}>{task.linkedEntityName}</strong>
              </span>
            )}
          </div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {task.title}
          </h4>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: task.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-primary)' }}>
            {task.dueDateTime}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
            Assignee: {task.assignee}
          </div>
        </div>
      </div>

      {(task.notes || onActionClick || onStatusChange) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--rv-text-secondary)', flex: 1, paddingRight: '12px' }}>
            {task.notes && (
              <span style={{ fontStyle: 'italic' }}>"{task.notes}"</span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {task.status !== 'Done' && onStatusChange && (
              <Button variant="ghost" size="sm" onClick={() => onStatusChange(task, 'Done')}>
                ✓ Mark Done
              </Button>
            )}
            {onActionClick && (
              <Button variant="secondary" size="sm" onClick={() => onActionClick(task)}>
                Open {task.linkedEntityType || 'Task'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
