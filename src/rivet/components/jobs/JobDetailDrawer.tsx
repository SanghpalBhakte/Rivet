import React, { useState } from 'react';
import { Job, JobStatus } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface JobDetailDrawerProps {
  job: Job | null;
  onClose: () => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => void;
  onAddNote: (jobId: string, noteText: string) => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  onClose,
  onUpdateStatus,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');

  if (!job) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(job.id, noteInput.trim());
    setNoteInput('');
  };

  const getStatusBadgeVariant = (st: JobStatus) => {
    switch (st) {
      case 'Scheduled': return 'scheduled';
      case 'In Progress': return 'active';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'overdue';
      default: return 'neutral';
    }
  };

  return (
    <div className="rv-drawer-overlay" onClick={onClose}>
      <aside
        className="rv-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Work order details for ${job.jobCode}`}
      >
        {/* Header */}
        <div className="rv-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
              <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-brand)', fontWeight: 600 }}>
                {job.jobCode}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {job.serviceTitle}
            </h2>
            <div className="rv-mono rv-num" style={{ fontSize: '12px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
              {job.customerName} ({job.customerPhone})
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close drawer">
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="rv-drawer__body">
          {/* Dispatch Action Control */}
          <div style={{ background: 'var(--rv-bg-elevated)', padding: '14px', borderRadius: 'var(--rv-radius-md)', border: '1px solid var(--rv-border-default)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '6px' }}>Dispatch Action & Status</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--rv-text-muted)' }}>Scheduled: </span>
                <strong className="rv-num" style={{ fontSize: '12.5px', color: 'var(--rv-text-primary)' }}>{job.scheduledDateTime}</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {job.status === 'Scheduled' && (
                  <Button variant="primary" size="sm" onClick={() => onUpdateStatus(job.id, 'In Progress')}>
                    🚗 Dispatch Vehicle
                  </Button>
                )}
                {job.status === 'In Progress' && (
                  <Button variant="primary" size="sm" onClick={() => onUpdateStatus(job.id, 'Completed')}>
                    ✓ Mark Completed
                  </Button>
                )}
                {job.status === 'Completed' && (
                  <Badge variant="completed">Work Order Complete</Badge>
                )}
                {job.status === 'Cancelled' && (
                  <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(job.id, 'Scheduled')}>
                    🔄 Reopen Job
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '14px', borderRadius: 'var(--rv-radius-md)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Route Waypoints</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div>
                <span style={{ color: 'var(--rv-text-muted)' }}>Pickup: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{job.pickupLocation}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--rv-text-muted)' }}>Destination: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{job.dropLocation}</strong>
              </div>
            </div>
          </div>

          {/* Assigned Crew & Vehicle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '12px', borderRadius: 'var(--rv-radius-md)' }}>
              <div className="rv-kicker">Assigned Driver</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '4px' }}>
                {job.driverName}
              </div>
            </div>
            <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '12px', borderRadius: 'var(--rv-radius-md)' }}>
              <div className="rv-kicker">Vehicle Allocation</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '4px' }}>
                {job.vehicleDetails}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '14px', borderRadius: 'var(--rv-radius-md)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Payment & Billing</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Total Amount</div>
                <div className="rv-num" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>{job.payment.totalAmount}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Advance Paid</div>
                <div className="rv-num" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-status-completed-text)' }}>{job.payment.advancePaid}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Due Balance</div>
                <div className="rv-num" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-status-overdue-text)' }}>{job.payment.dueAmount}</div>
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          <div>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Dispatch Notes</div>
            <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="rv-input"
                placeholder="Log dispatch update, toll note, fuel charge..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add Note
              </Button>
            </form>

            <div className="rv-timeline">
              {job.notes && job.notes.length > 0 ? (
                job.notes.map((note) => (
                  <div key={note.id} className="rv-timeline-item">
                    <div className="rv-timeline-dot" />
                    <div className="rv-timeline-content">
                      <div className="rv-timeline-title">{note.author}</div>
                      <div className="rv-timeline-desc">{note.text}</div>
                      <div className="rv-timeline-time">{note.timestamp}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--rv-text-muted)', padding: '8px 0' }}>
                  No dispatch notes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
