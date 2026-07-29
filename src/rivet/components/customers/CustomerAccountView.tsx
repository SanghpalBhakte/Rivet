import React, { useState } from 'react';
import { CustomerRecord, Lead, Job, PaymentRecord, TaskRecord, TaskType, TaskPriority } from '../../types/rivet';
import { getCustomerOperationalAccount } from '../../utils/customerMapper';
import { INITIAL_TASKS } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { TaskItem } from '../ui/TaskItem';

interface CustomerAccountViewProps {
  customer: CustomerRecord;
  allLeads: Lead[];
  allJobs: Job[];
  allPayments: PaymentRecord[];
  allTasks?: TaskRecord[];
  onBack: () => void;
  onAddNote: (customerId: string, noteText: string) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  customer,
  allLeads,
  allJobs,
  allPayments,
  allTasks = INITIAL_TASKS,
  onBack,
  onAddNote,
}) => {
  const [tasksList, setTasksList] = useState<TaskRecord[]>(allTasks);
  const [noteInput, setNoteInput] = useState('');
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);

  // New Reminder Form State
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderType, setReminderType] = useState<TaskType>('Callback');
  const [reminderDue, setReminderDue] = useState('Tomorrow, 10:00 AM');
  const [reminderPriority, setReminderPriority] = useState<TaskPriority>('Normal');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Retrieve dynamically aggregated operational account data
  const account = getCustomerOperationalAccount(customer, allLeads, allJobs, allPayments, tasksList);
  const { counters, nextAction, linkedLeads, linkedJobs, linkedPayments, linkedTasks, timeline } = account;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(customer.id, noteInput.trim());
    setNoteInput('');
    showToast('Internal note logged to customer account');
  };

  const handleCreateReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    const newTask: TaskRecord = {
      id: `tsk-${Date.now()}`,
      title: reminderTitle.trim(),
      type: reminderType,
      status: 'Open',
      priority: reminderPriority,
      dueDateTime: reminderDue,
      assignee: 'Ops Desk',
      linkedEntityId: customer.id,
      linkedEntityType: 'Customer',
      linkedEntityName: customer.name,
      notes: `Scheduled reminder for ${customer.name}`,
    };

    setTasksList((prev) => [newTask, ...prev]);
    setReminderTitle('');
    setShowAddReminderForm(false);
    showToast(`Created ${reminderType} reminder for ${customer.name}`);
  };

  const handleTaskStatusChange = (task: TaskRecord, newStatus: TaskRecord['status']) => {
    setTasksList((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    showToast(`Marked reminder as ${newStatus}`);
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const formatRupees = (num: number) => `₹${num.toLocaleString('en-IN')}`;

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'Active Lead': return 'callback';
      case 'Job In Progress': return 'job';
      case 'Payment Due': return 'overdue';
      case 'Repeat Client': return 'completed';
      default: return 'neutral';
    }
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'New': return 'callback';
      case 'Contacted': return 'neutral';
      case 'Quote Sent': return 'overdue';
      case 'Confirmed': return 'job';
      case 'Closed': return 'completed';
      case 'Lost': return 'neutral';
      default: return 'neutral';
    }
  };

  const getJobStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'callback';
      case 'In Progress': return 'job';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'completed';
      case 'Partial': return 'job';
      case 'Due Soon': return 'callback';
      case 'Overdue': return 'overdue';
      default: return 'neutral';
    }
  };

  const cleanPhone = customer.phone.replace(/[^0-9+]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${customer.name}, reaching out from Janai Tours & Travels.`)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Breadcrumb & Return Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rv-border-subtle)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={onBack}>
            ← Back to Customers
          </Button>
          <span style={{ fontSize: '12px', color: 'var(--rv-text-muted)' }}>
            Customers / <strong className="rv-tabular" style={{ color: 'var(--rv-text-primary)' }}>{customer.customerCode}</strong> — {customer.name}
          </span>
        </div>

        {actionSuccessMsg && (
          <span style={{ fontSize: '12px', color: 'var(--rv-status-completed-text)', fontWeight: 600, background: 'var(--rv-status-completed-bg)', padding: '2px 8px', borderRadius: '4px' }}>
            ✓ {actionSuccessMsg}
          </span>
        )}
      </div>

      {/* A. Header Area */}
      <Card dense className="rv-card--hero" style={{ background: 'var(--rv-bg-surface-elevated)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          {/* Identity & Status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant={getHealthBadgeVariant(customer.healthStatus)}>
                {customer.healthStatus.toUpperCase()}
              </Badge>
              <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                {customer.customerCode}
              </span>
              <span style={{ fontSize: '11px', background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', padding: '1px 6px', borderRadius: '4px', color: 'var(--rv-text-secondary)' }}>
                Source: WhatsApp / Website
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--rv-text-primary)', margin: '0 0 6px 0' }}>
              {customer.name}
            </h2>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--rv-text-secondary)' }}>
              <span>📞 Phone: <a href={`tel:${cleanPhone}`} style={{ color: 'var(--rv-text-primary)', textDecoration: 'none' }} className="rv-num">{customer.phone}</a></span>
              <span>✉️ Email: <span style={{ color: 'var(--rv-text-primary)' }}>{customer.email}</span></span>
              <span>📍 Location: <span style={{ color: 'var(--rv-text-primary)' }}>{customer.city}</span></span>
            </div>
          </div>

          {/* Quick Operational Controls Header */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={`tel:${cleanPhone}`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">
                📞 Call
              </Button>
            </a>
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" style={{ borderColor: 'rgba(37, 211, 102, 0.4)', color: '#25d366' }}>
                💬 WhatsApp
              </Button>
            </a>
            <Button variant="secondary" size="sm" onClick={() => setShowAddReminderForm(true)}>
              ⏰ + Reminder
            </Button>
            <Button variant="secondary" size="sm" onClick={() => showToast('Dispatched new job order form for customer')}>
              🚚 + Job
            </Button>
            <Button variant="primary" size="sm" onClick={() => showToast('Opened payment recorder for customer')}>
              💳 + Record Payment
            </Button>
          </div>
        </div>
      </Card>

      {/* B. Overview Strip (Calm Operational Counters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inquiries
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
            {counters.totalInquiries}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Jobs
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
            {counters.totalJobs}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Jobs
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: counters.activeJobs > 0 ? 'var(--rv-status-job-text)' : 'var(--rv-text-secondary)', marginTop: '2px' }}>
            {counters.activeJobs}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Paid
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-completed-text)', marginTop: '2px' }}>
            {formatRupees(counters.totalSpent)}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Due
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: counters.outstandingBalance > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)', marginTop: '2px' }}>
            {counters.outstandingBalance > 0 ? formatRupees(counters.outstandingBalance) : 'Settled ₹0'}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Last Contact
          </div>
          <div className="rv-tabular" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '4px' }}>
            {counters.lastContactDate}
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '16px' }} className="rv-customer-workspace">
        {/* LEFT COLUMN: Operational Records (Sections C, D, E, Tasks, F) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Tasks & Follow-up Reminders Section */}
          <Card dense>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔔 Tasks & Follow-up Reminders ({linkedTasks.length})
              </span>
              <Button
                variant={showAddReminderForm ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => setShowAddReminderForm(!showAddReminderForm)}
              >
                {showAddReminderForm ? 'Cancel' : '+ Add Reminder'}
              </Button>
            </div>

            {/* 1-Click Reminder Creation Form */}
            {showAddReminderForm && (
              <form onSubmit={handleCreateReminderSubmit} style={{ background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', padding: '12px', borderRadius: '6px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-primary)', textTransform: 'uppercase' }}>
                  Create New Follow-up Reminder for {customer.name}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="rv-lead-note-input"
                    placeholder="Reminder title (e.g., Call back for quote review...)"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    style={{ flex: 2, minWidth: '200px' }}
                    required
                  />

                  <select
                    className="rv-lead-note-input"
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as TaskType)}
                    style={{ flex: 1, minWidth: '130px' }}
                  >
                    <option value="Callback">Callback</option>
                    <option value="Quote Follow-up">Quote Follow-up</option>
                    <option value="Payment Reminder">Payment Reminder</option>
                    <option value="Dispatch Follow-up">Dispatch Follow-up</option>
                    <option value="Send Note">Send Note</option>
                  </select>

                  <input
                    type="text"
                    className="rv-lead-note-input"
                    placeholder="Due timing (e.g., Tomorrow, 11:00 AM)"
                    value={reminderDue}
                    onChange={(e) => setReminderDue(e.target.value)}
                    style={{ flex: 1, minWidth: '150px' }}
                  />

                  <select
                    className="rv-lead-note-input"
                    value={reminderPriority}
                    onChange={(e) => setReminderPriority(e.target.value as TaskPriority)}
                    style={{ flex: 1, minWidth: '100px' }}
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical</option>
                  </select>

                  <Button type="submit" variant="primary" size="sm">
                    Save Reminder
                  </Button>
                </div>
              </form>
            )}

            {linkedTasks.length === 0 ? (
              <EmptyState
                icon="🔔"
                title="No active reminders for this customer"
                description="Use the + Add Reminder action to schedule callbacks or follow-up notes."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                    onActionClick={() => showToast(`Selected reminder ${task.title}`)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* C. Lead / Inquiry History */}
          <Card dense>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📋 Lead & Inquiry History ({linkedLeads.length})
              </span>
            </div>

            {linkedLeads.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No inquiries recorded yet"
                description="Use the + New Inquiry action on the Leads page to capture inquiries for this client."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      background: 'var(--rv-bg-base)',
                      border: '1px solid var(--rv-border-default)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <Badge variant={getStageBadgeVariant(lead.stage)}>{lead.stage.toUpperCase()}</Badge>
                        <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                          {lead.id.toUpperCase()} • Created {lead.createdAt}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                        {lead.serviceTitle}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
                        Source: <strong>{lead.source}</strong> • Assigned: <strong>{lead.assignee}</strong> • Follow-up: <span className="rv-num">{lead.nextFollowUp}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-secondary)' }}>
                        {lead.quoteAmount || lead.budget}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => showToast(`Opened Lead ${lead.id.toUpperCase()}`)}>
                        Open Lead
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* D. Jobs History */}
          <Card dense>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🚚 Jobs & Work Orders ({linkedJobs.length})
              </span>
            </div>

            {linkedJobs.length === 0 ? (
              <EmptyState
                icon="🚚"
                title="No work orders created yet"
                description="Convert a confirmed lead to create the first active job for this customer."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedJobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      background: 'var(--rv-bg-base)',
                      border: '1px solid var(--rv-border-default)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <Badge variant={getJobStatusBadgeVariant(job.status)}>{job.status.toUpperCase()}</Badge>
                        <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                          {job.jobCode}
                        </span>
                        <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                          • {job.scheduledDateTime}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                        {job.serviceTitle}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
                        Driver: <strong>{job.driverName}</strong> ({job.vehicleDetails}) • Pickup: <strong>{job.pickupLocation}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                          {job.payment.totalAmount}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)' }}>
                          Due: {job.payment.dueAmount}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => showToast(`Opened Work Order ${job.jobCode}`)}>
                        Open Job
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* E. Payments History */}
          <Card dense>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                💳 Payments & Accounts History ({linkedPayments.length})
              </span>
            </div>

            {linkedPayments.length === 0 ? (
              <EmptyState
                icon="💳"
                title="No payment records logged"
                description="Payments recorded for work orders will appear automatically in this account view."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedPayments.map((pay) => (
                  <div
                    key={pay.id}
                    style={{
                      background: 'var(--rv-bg-base)',
                      border: '1px solid var(--rv-border-default)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <Badge variant={getPaymentStatusBadgeVariant(pay.status)}>{pay.status.toUpperCase()}</Badge>
                        <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                          {pay.paymentCode}
                        </span>
                        <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                          • Ref: {pay.jobCode}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                        {pay.serviceTitle}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
                        Method: <strong>{pay.paymentMethod}</strong> • Due Date: <span className="rv-num">{pay.dueDate}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-status-completed-text)' }}>
                          Paid: ₹{pay.amountPaid.toLocaleString()}
                        </div>
                        <div
                          className="rv-num"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: pay.balanceDue > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-muted)',
                          }}
                        >
                          Balance: ₹{pay.balanceDue.toLocaleString()}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => showToast(`Opened Invoice ${pay.paymentCode}`)}>
                        View Record
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* F. Notes & Activity Log */}
          <Card dense>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rv-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
              📋 Running Activity Timeline & Ops Notes
            </span>

            {/* Note Logging Input Form */}
            <form onSubmit={handleNoteSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Log internal note or call summary for ops..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary" size="sm">
                Add Note
              </Button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {timeline.map((item) => (
                <div key={item.id} className="rv-lead-note-card" style={{ borderLeft: '2px solid var(--rv-border-strong)', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--rv-text-primary)' }}>{item.title}</strong>
                      {item.badgeLabel && (
                        <Badge variant={item.type === 'payment' ? 'completed' : item.type === 'job' ? 'job' : 'callback'}>
                          {item.badgeLabel}
                        </Badge>
                      )}
                    </div>
                    <span className="rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                      {item.date}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--rv-text-secondary)', marginTop: '2px' }}>
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: G. Next Action Guidance Panel ("What should ops do next?") */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card dense style={{ borderLeft: '3px solid var(--rv-status-overdue-text)', background: 'var(--rv-bg-surface-elevated)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rv-status-overdue-text)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              🎯 Ops Next Action Guidance
            </span>

            <div style={{ background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase' }}>Recommended Next Step</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
                {nextAction.recommendedAction}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <span className="rv-text-muted">📅 Next Follow-up Due: </span>
                <strong className="rv-num" style={{ color: 'var(--rv-text-primary)' }}>{nextAction.followUpDue}</strong>
              </div>

              <div>
                <span className="rv-text-muted">💳 Pending Balance: </span>
                <strong className="rv-num" style={{ color: counters.outstandingBalance > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)' }}>
                  {nextAction.pendingPaymentText}
                </strong>
              </div>

              <div>
                <span className="rv-text-muted">🚚 Active Job Status: </span>
                <span style={{ color: 'var(--rv-text-primary)', fontWeight: 500 }}>
                  {nextAction.activeJobText}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--rv-border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <span className="rv-text-muted">📝 Latest Recorded Note: </span>
                <p style={{ fontSize: '12px', color: 'var(--rv-text-secondary)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                  "{nextAction.latestNoteText}"
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Action Triggers Card */}
          <Card dense style={{ background: 'var(--rv-bg-surface)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Quick Action Triggers
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddReminderForm(true)}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                ⏰ Schedule Follow-Up Reminder
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast(`Prepared custom quotation for ${customer.name}`)}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                📄 Send Revised Quote
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast(`Generated payment receipt for ${customer.name}`)}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                🧾 Generate Payment Receipt
              </Button>

              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ width: '100%', justifyContent: 'flex-start', color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                >
                  💬 Open Direct WhatsApp Chat
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
