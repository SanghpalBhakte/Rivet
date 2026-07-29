import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_TASKS } from '../../data/mockData';
import { TaskRecord, TaskStatus, TaskType, TaskPriority, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { TaskItem } from '../ui/TaskItem';
import { ApiService } from '../../services/api';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | TaskType>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [simMode, setSimMode] = useState<SimulationMode>('normal');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getTasks().then(setTasks);
  }, []);

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

  // Unique assignees list for filter
  const assigneesList = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => { if (t.assignee) set.add(t.assignee); });
    return ['All', ...Array.from(set)];
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'All' || t.assignee === assigneeFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.linkedEntityName && t.linkedEntityName.toLowerCase().includes(q)) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));

      return matchesStatus && matchesType && matchesPriority && matchesAssignee && matchesSearch;
    });
  }, [tasks, statusFilter, typeFilter, priorityFilter, assigneeFilter, searchQuery]);

  // Sort tasks: Overdue > Due Soon > Open > Done, then Critical > High > Normal
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
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    showToast(`Marked task "${task.title}" as ${newStatus}`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTaskRecord: TaskRecord = {
      id: `tsk-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      status: 'Open',
      priority: newPriority,
      dueDateTime: newDue,
      assignee: newAssignee,
      linkedEntityName: newLinkedEntity || undefined,
      linkedEntityType: newLinkedEntity ? 'Lead' : undefined,
      notes: newNotes.trim() || undefined,
    };

    setTasks((prev) => [newTaskRecord, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setShowCreateModal(false);
    showToast(`Created task "${newTaskRecord.title}"`);
  };

  const getStatusCount = (st: 'All' | TaskStatus) => {
    if (st === 'All') return tasks.length;
    return tasks.filter((t) => t.status === st).length;
  };

  const STATUS_FILTERS: ('All' | TaskStatus)[] = ['All', 'Open', 'Due Soon', 'Overdue', 'Done'];

  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  // Snooze task handler (postpones due time by 2 hours / tomorrow)
  const handleSnoozeTask = (task: TaskRecord) => {
    const updatedDue = 'Tomorrow, 10:00 AM';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, dueDateTime: updatedDue, status: 'Due Soon' } : t))
    );
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask((prev) => (prev ? { ...prev, dueDateTime: updatedDue, status: 'Due Soon' } : null));
    }
    showToast(`Snoozed task "${task.title}" to ${updatedDue}`);
  };

  // Reassign task handler
  const handleReassignTask = (taskId: string, newAssignee: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, assignee: newAssignee } : null));
    }
    showToast(`Reassigned task to ${newAssignee}`);
  };

  // Add note to task handler
  const handleAddTaskNote = (taskId: string, noteText: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentNotes = t.notes ? `${t.notes}\n[Ops Note]: ${noteText}` : noteText;
        return { ...t, notes: currentNotes };
      })
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) =>
        prev ? { ...prev, notes: prev.notes ? `${prev.notes}\n[Ops Note]: ${noteText}` : noteText } : null
      );
    }
    showToast('Appended note to task record');
  };

  return (
    <div>
      <PageHeader
        title="Tasks & Operational Reminders Queue"
        subline="Central follow-up control room • Callbacks, quote checks, payment reminders & dispatch notes"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Top Counters Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Reminders
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
            {tasks.length}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overdue
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-overdue-text)', marginTop: '2px' }}>
            {getStatusCount('Overdue')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Due Soon
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-callback-text)', marginTop: '2px' }}>
            {getStatusCount('Due Soon')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Open Tasks
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-secondary)', marginTop: '2px' }}>
            {getStatusCount('Open')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-completed-text)', marginTop: '2px' }}>
            {getStatusCount('Done')}
          </div>
        </div>
      </div>

      {/* Tasks V2 Two-Column Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTask ? 'minmax(0, 1fr) 350px' : '1fr', gap: '16px' }} className="rv-customer-workspace">
        {/* Main Operational Task Inbox */}
        <Card dense className="rv-card--hero">
          {/* Header Action Bar with + Create Task */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--rv-text-primary)' }}>
                Operational Inbox ({sortedTasks.length})
              </h3>
              {actionMsg && (
                <span style={{ fontSize: '11px', color: 'var(--rv-status-completed-text)', fontWeight: 600, background: 'var(--rv-status-completed-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ {actionMsg}
                </span>
              )}
            </div>

            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(!showCreateModal)}>
              {showCreateModal ? 'Cancel' : '⚡ + Create Task'}
            </Button>
          </div>

          {/* Create Task Form */}
          {showCreateModal && (
            <form onSubmit={handleCreateTask} style={{ background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', padding: '14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase' }}>
                Create Operations Task / Reminder
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <input
                  type="text"
                  className="rv-lead-note-input"
                  placeholder="Task title (e.g. Call client for payment confirmation)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />

                <select
                  className="rv-lead-note-input"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TaskType)}
                >
                  <option value="Callback">Callback</option>
                  <option value="Quote Follow-up">Quote Follow-up</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                  <option value="Dispatch Follow-up">Dispatch Follow-up</option>
                  <option value="Send Note">Send Note</option>
                  <option value="General">General</option>
                </select>

                <input
                  type="text"
                  className="rv-lead-note-input"
                  placeholder="Due timing (e.g. Today, 5:00 PM)"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                />

                <select
                  className="rv-lead-note-input"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Priority</option>
                </select>

                <select
                  className="rv-lead-note-input"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                >
                  <option value="Janai Desk">Janai Desk</option>
                  <option value="Suresh M.">Suresh M.</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Ops Desk">Ops Desk</option>
                </select>

                <input
                  type="text"
                  className="rv-lead-note-input"
                  placeholder="Linked client / record name (optional)"
                  value={newLinkedEntity}
                  onChange={(e) => setNewLinkedEntity(e.target.value)}
                />
              </div>

              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Internal ops note or instruction details (optional)..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Operations Task
                </Button>
              </div>
            </form>
          )}

          {/* Search & Multi-Filter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div className="rv-leads-bar" style={{ marginBottom: 0 }}>
              {/* Search Input */}
              <div className="rv-search-wrapper">
                <span className="rv-search-icon">🔍</span>
                <input
                  type="text"
                  className="rv-search-input"
                  placeholder="Search tasks by title, type, linked customer, assignee, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="rv-search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="rv-queue-tabs" role="tablist" aria-label="Filter tasks by status">
                {STATUS_FILTERS.map((st) => (
                  <button
                    key={st}
                    className={`rv-queue-tab ${statusFilter === st ? 'rv-queue-tab--active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                    role="tab"
                    aria-selected={statusFilter === st}
                  >
                    <span style={{ color: st === 'Overdue' && getStatusCount('Overdue') > 0 ? 'var(--rv-status-overdue-text)' : undefined }}>
                      {st}
                    </span>
                    <span className="rv-queue-tab__count rv-num">{getStatusCount(st)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Filter Selectors */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--rv-bg-base)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--rv-border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>Filters:</span>
              
              <select
                className="rv-lead-note-input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
              >
                <option value="All">All Types</option>
                <option value="Callback">Callback</option>
                <option value="Quote Follow-up">Quote Follow-up</option>
                <option value="Payment Reminder">Payment Reminder</option>
                <option value="Dispatch Follow-up">Dispatch Follow-up</option>
                <option value="Send Note">Send Note</option>
                <option value="General">General</option>
              </select>

              <select
                className="rv-lead-note-input"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>

              <select
                className="rv-lead-note-input"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }}
              >
                {assigneesList.map((a) => (
                  <option key={a} value={a}>
                    {a === 'All' ? 'All Assignees' : `Assignee: ${a}`}
                  </option>
                ))}
              </select>

              {(typeFilter !== 'All' || priorityFilter !== 'All' || assigneeFilter !== 'All') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('All');
                    setPriorityFilter('All');
                    setAssigneeFilter('All');
                  }}
                  style={{ fontSize: '11px' }}
                >
                  Clear Secondary Filters
                </Button>
              )}
            </div>
          </div>

          {/* Task List Rendering */}
          {simMode === 'loading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : simMode === 'empty' || sortedTasks.length === 0 ? (
            <EmptyState
              icon="✓"
              title="No operational tasks match your filters"
              description="Clear your search filters or create a new task reminder using the button above."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onSelect={(task) => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  onStatusChange={handleStatusChange}
                  onSnooze={handleSnoozeTask}
                  onActionClick={(task) => showToast(`Opened linked record for ${task.linkedEntityName || task.title}`)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Secondary Detail Panel for Selected Task */}
        {selectedTask && (
          <Card dense style={{ background: 'var(--rv-bg-surface-elevated)', border: '1px solid var(--rv-border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid var(--rv-border-subtle)', paddingBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Task Detail & Context
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: 'var(--rv-text-primary)' }}>
                  {selectedTask.title}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                ✕
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <span className="rv-text-muted">Due Schedule: </span>
                <strong className="rv-num" style={{ color: 'var(--rv-text-primary)' }}>{selectedTask.dueDateTime}</strong>
              </div>

              <div>
                <span className="rv-text-muted">Task Type: </span>
                <span style={{ fontWeight: 600, color: 'var(--rv-text-primary)' }}>{selectedTask.type}</span>
              </div>

              <div>
                <span className="rv-text-muted">Assignee: </span>
                <select
                  className="rv-lead-note-input"
                  value={selectedTask.assignee}
                  onChange={(e) => handleReassignTask(selectedTask.id, e.target.value)}
                  style={{ fontSize: '11px', padding: '2px 6px', marginTop: '2px' }}
                >
                  <option value="Janai Desk">Janai Desk</option>
                  <option value="Suresh M.">Suresh M.</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Ops Desk">Ops Desk</option>
                </select>
              </div>

              {selectedTask.linkedEntityName && (
                <div style={{ background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase' }}>Linked Record</div>
                  <strong style={{ fontSize: '12px', color: 'var(--rv-brand)' }}>{selectedTask.linkedEntityType}: {selectedTask.linkedEntityName}</strong>
                </div>
              )}

              <div>
                <span className="rv-text-muted">Task Notes & Logs: </span>
                <p style={{ background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-subtle)', padding: '8px', borderRadius: '4px', fontStyle: 'italic', margin: '4px 0 0 0', color: 'var(--rv-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {selectedTask.notes || 'No detailed instructions added.'}
                </p>
              </div>

              {/* Append Note Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('noteText') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleAddTaskNote(selectedTask.id, input.value.trim());
                    input.value = '';
                  }
                }}
                style={{ display: 'flex', gap: '6px', marginTop: '4px' }}
              >
                <input
                  type="text"
                  name="noteText"
                  className="rv-lead-note-input"
                  placeholder="Add ops note to task..."
                  style={{ flex: 1, fontSize: '11px' }}
                  required
                />
                <Button type="submit" variant="primary" size="sm">
                  Add
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
