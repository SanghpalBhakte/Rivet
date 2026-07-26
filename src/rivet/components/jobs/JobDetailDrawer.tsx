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

const JOB_STATUSES: JobStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

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
      case 'Scheduled': return 'callback';
      case 'In Progress': return 'job';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'overdue';
      default: return 'neutral';
    }
  };

  return (
    <div className="rv-lead-drawer-overlay" onClick={onClose}>
      <div
        className="rv-lead-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Work order details for ${job.jobCode}`}
      >
        {/* Drawer Header */}
        <div className="rv-lead-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant={getStatusBadgeVariant(job.status)}>{job.status.toUpperCase()}</Badge>
              <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                {job.jobCode}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {job.serviceTitle}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close work order panel">
            ✕
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="rv-lead-drawer__body">
          {/* Status Progression Action Card */}
          <div className="rv-lead-drawer__section" style={{ background: 'var(--rv-bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--rv-border-default)' }}>
            <span className="rv-lead-drawer__label" style={{ marginBottom: '6px' }}>Dispatch Action</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div>
                <span className="rv-text-muted">Schedule: </span>
                <strong className="rv-num">{job.scheduledDateTime}</strong>
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

          {/* Route & Location Details */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Route & Locations</span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div>
                <span className="rv-text-muted">Pickup: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{job.pickupLocation}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Drop / Destination: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{job.dropLocation}</strong>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver Assignment */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Vehicle & Driver Assignment</span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
              <div>
                <span className="rv-text-muted">Assigned Driver: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{job.driverName}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Vehicle Details: </span>
                <span>{job.vehicleDetails}</span>
              </div>
              <div>
                <span className="rv-text-muted">Customer: </span>
                <span>{job.customerName} ({job.customerPhone})</span>
              </div>
            </div>
          </div>

          {/* Payment Snapshot (Visibility Only) */}
          <div className="rv-lead-drawer__section" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--rv-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="rv-lead-drawer__label">Payment Snapshot</span>
              <Badge variant={job.payment.status === 'Paid' ? 'completed' : 'overdue'}>
                {job.payment.status.toUpperCase()}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '6px' }}>
              <div>
                <span className="rv-text-muted">Total Order: </span>
                <strong className="rv-num">{job.payment.totalAmount}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Advance Paid: </span>
                <span className="rv-num">{job.payment.advancePaid}</span>
              </div>
              <div>
                <span className="rv-text-muted">Balance Due: </span>
                <strong className="rv-num" style={{ color: job.payment.dueAmount !== '₹0' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-secondary)' }}>
                  {job.payment.dueAmount}
                </strong>
              </div>
              <div>
                <span className="rv-text-muted">Payment Mode: </span>
                <span>{job.payment.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Status Override Buttons */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Override Job Status</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {JOB_STATUSES.map((st) => (
                <button
                  key={st}
                  className={`rv-stage-pill ${job.status === st ? 'rv-stage-pill--active' : ''}`}
                  onClick={() => onUpdateStatus(job.id, st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Activity & Internal Notes Log */}
          <div className="rv-lead-drawer__section" style={{ borderBottom: 'none' }}>
            <span className="rv-lead-drawer__label">Dispatch Log & Internal Notes ({job.notes.length})</span>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Log dispatch update or driver note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
            </form>

            {/* Notes List */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {job.notes.map((n) => (
                <div key={n.id} className="rv-lead-note-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--rv-text-muted)', marginBottom: '2px' }}>
                    <strong style={{ color: 'var(--rv-text-secondary)' }}>{n.author}</strong>
                    <span className="rv-num">{n.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--rv-text-primary)' }}>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
