import React, { useState, useMemo, useEffect } from 'react';
import { TaskRecord, TaskStatus, TaskType, TaskPriority } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { TaskItem } from '../ui/TaskItem';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TasksView: React.FC = () => {
  const { user, can } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | TaskType>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    ApiService.getTasks(user?.workspaceId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user?.workspaceId]);

  // New Task Form Modal/Inline state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskType>('Callback');
  const [newDue, setNewDue] = useState('Today, 5:00 PM');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Normal');
  const [newAssignee, setNewAssignee] = useState('Janai Desk');
  const [newLinkedEntity, setNewLinkedEntity] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.linkedEntityName && t.linkedEntityName.toLowerCase().includes(q)) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));

      return matchesStatus && matchesType && matchesPriority && matchesSearch;
    });
  }, [tasks, statusFilter, typeFilter, priorityFilter, searchQuery]);

  // Sort tasks: Overdue > Due Soon > Open > Done
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const statusOrder: Record<TaskStatus, number> = {
        Overdue: 0,
        'Due Soon': 1,
        Open: 2,
        Done: 3,
      };
      const priorityOrder: Record<TaskPriority, number> = {
        Critical: 0,
        High: 1,
        Normal: 2,
      };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTasks]);

  const handleStatusChange = (task: TaskRecord, newStatus: TaskStatus) => {
    if (!can('task:update_status')) {
      alert(`Role "${user?.role}" does not have permission to update task status.`);
      return;
    }
    ApiService.updateTaskStatus(task.id, newStatus, actor)
      .then(setTasks)
      .catch(console.error);
    showToast(`Marked task "${task.title}" as ${newStatus}`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!can('task:create')) {
      alert(`Role "${user?.role}" cannot create new tasks.`);
      return;
    }

    ApiService.createTask({
      title: newTitle.trim(),
      type: newType,
      priority: newPriority,
      dueDateTime: newDue,
      assignee: newAssignee,
      linkedEntityName: newLinkedEntity || undefined,
      linkedEntityType: newLinkedEntity ? 'Lead' : undefined,
      notes: newNotes.trim() || undefined,
    }, actor.workspaceId, actor)
      .then(setTasks)
      .catch(console.error);

    setNewTitle('');
    setNewNotes('');
    setShowCreateModal(false);
    showToast(`Task "${newTitle.trim()}" created`);
  };

  const getStatusCount = (st: 'All' | TaskStatus) => {
    if (st === 'All') return tasks.length;
    return tasks.filter((t) => t.status === st).length;
  };

  const STATUS_FILTERS: ('All' | TaskStatus)[] = ['All', 'Open', 'Due Soon', 'Overdue', 'Done'];

  return (
    <div>
      <PageHeader
        kicker="Work & Reminders"
        title="Tasks & Queue"
        subline="Operational follow-up queue, quote checks, driver callbacks, and payment reminders"
        action={
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(!showCreateModal)}>
            {showCreateModal ? 'Cancel' : '+ Create Task'}
          </Button>
        }
      />

      {/* Telemetry Status Strip */}
      <div className="rv-telemetry-bar" style={{ marginBottom: '20px' }}>
        <div className="rv-telemetry-item">
          <div className="rv-telemetry-item__value rv-num">{tasks.length}</div>
          <div className="rv-telemetry-item__label">Total Tasks</div>
          <div className="rv-telemetry-item__subtext">All active reminders</div>
        </div>

        <div className={`rv-telemetry-item ${getStatusCount('Overdue') > 0 ? 'rv-telemetry-item--urgent' : ''}`}>
          <div className="rv-telemetry-item__value rv-num" style={{ color: getStatusCount('Overdue') > 0 ? 'var(--rv-status-overdue-text)' : undefined }}>
            {getStatusCount('Overdue')}
          </div>
          <div className="rv-telemetry-item__label">Overdue</div>
          <div className="rv-telemetry-item__subtext">Immediate action required</div>
        </div>

        <div className="rv-telemetry-item">
          <div className="rv-telemetry-item__value rv-num" style={{ color: 'var(--rv-accent-sky)' }}>
            {getStatusCount('Due Soon')}
          </div>
          <div className="rv-telemetry-item__label">Due Today</div>
          <div className="rv-telemetry-item__subtext">Upcoming shift follow-ups</div>
        </div>

        <div className="rv-telemetry-item">
          <div className="rv-telemetry-item__value rv-num" style={{ color: 'var(--rv-status-completed-text)' }}>
            {getStatusCount('Done')}
          </div>
          <div className="rv-telemetry-item__label">Completed</div>
          <div className="rv-telemetry-item__subtext">Closed & settled tasks</div>
        </div>
      </div>

      {/* Inline Create Form */}
      {showCreateModal && (
        <div className="rv-card" style={{ marginBottom: '20px', border: '1px solid var(--rv-brand-border)' }}>
          <div className="rv-kicker" style={{ marginBottom: '8px' }}>Create Operations Task</div>
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Task Title *</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Call Rajesh for advance UPI transfer..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Category</label>
                <select
                  className="rv-select"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TaskType)}
                >
                  <option value="Callback">Callback</option>
                  <option value="Quote Follow-up">Quote Follow-up</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                  <option value="Dispatch Follow-up">Dispatch Follow-up</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Priority</label>
                <select
                  className="rv-select"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Amber)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Due Date & Time</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Today, 5:00 PM"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Assignee</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Janai Desk / Suresh M."
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Linked Entity (Optional)</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="e.g. Rajesh Sharma"
                  value={newLinkedEntity}
                  onChange={(e) => setNewLinkedEntity(e.target.value)}
                />
              </div>
            </div>

            <div className="rv-form-group" style={{ margin: 0 }}>
              <label className="rv-label">Notes & Instructions</label>
              <textarea
                className="rv-textarea"
                rows={2}
                placeholder="Details for desk staff..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button type="button" variant="secondary" size="md" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                + Save Task
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container */}
      <div className="rv-table-container">
        <div className="rv-table-header">
          {/* Status Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter tasks by status">
            {STATUS_FILTERS.map((st) => {
              const count = getStatusCount(st);
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  className={`rv-queue-tab ${isActive ? 'rv-queue-tab--active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{st}</span>
                  <span className="rv-queue-tab__count rv-num">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="rv-search-bar">
            <span style={{ color: 'var(--rv-text-muted)', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search tasks, client, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : sortedTasks.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={tasks.length === 0 ? "No Operational Tasks" : "No Matching Tasks Found"}
            description={
              tasks.length === 0
                ? "Task queue is clean. Scheduled follow-ups and payment reminders will appear here automatically."
                : "No tasks match your search or status filter."
            }
          />
        ) : (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
