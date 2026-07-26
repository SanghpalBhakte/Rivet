import React, { useState } from 'react';
import { CustomerRecord } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CustomerDetailDrawerProps {
  customer: CustomerRecord | null;
  onClose: () => void;
  onAddNote: (customerId: string, noteText: string) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  onClose,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');

  if (!customer) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(customer.id, noteInput.trim());
    setNoteInput('');
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'Active Lead': return 'callback';
      case 'Job In Progress': return 'job';
      case 'Payment Due': return 'overdue';
      case 'Repeat Client': return 'completed';
      default: return 'neutral';
    }
  };

  const formatRupees = (num: number) => `₹${num.toLocaleString('en-IN')}`;

  return (
    <div className="rv-lead-drawer-overlay" onClick={onClose}>
      <div
        className="rv-lead-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Customer profile for ${customer.name}`}
      >
        {/* Drawer Header */}
        <div className="rv-lead-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant={getHealthBadgeVariant(customer.healthStatus)}>
                {customer.healthStatus.toUpperCase()}
              </Badge>
              <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                {customer.customerCode}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {customer.name}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close customer drawer">
            ✕
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="rv-lead-drawer__body">
          {/* Customer Profile & Contact Details */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Customer Profile & Contact</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '13px' }}>
              <div>
                <span className="rv-text-muted">Phone: </span>
                <strong className="rv-num">{customer.phone}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Email: </span>
                <span>{customer.email}</span>
              </div>
              <div>
                <span className="rv-text-muted">Location / City: </span>
                <span>{customer.city}</span>
              </div>
            </div>
          </div>

          {/* Account & Financial Snapshot */}
          <div className="rv-lead-drawer__section" style={{ background: 'var(--rv-bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--rv-border-default)' }}>
            <span className="rv-lead-drawer__label" style={{ marginBottom: '6px' }}>Account Financial Snapshot</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginTop: '6px' }}>
              <div>
                <span className="rv-text-muted">Lifetime Value: </span>
                <strong className="rv-num">{formatRupees(customer.totalSpent)}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Balance Due: </span>
                <strong
                  className="rv-num"
                  style={{
                    color: customer.outstandingBalance > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)',
                  }}
                >
                  {customer.outstandingBalance > 0 ? formatRupees(customer.outstandingBalance) : 'Settled ₹0'}
                </strong>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                <span className="rv-text-muted">Next Follow-up Context: </span>
                <span className="rv-num" style={{ fontWeight: 500, color: 'var(--rv-text-primary)' }}>
                  {customer.nextFollowUp}
                </span>
              </div>
            </div>
          </div>

          {/* Combined Operational History Timeline */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Operational History Timeline</span>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customer.history.map((item) => (
                <div key={item.id} className="rv-lead-note-card" style={{ borderLeft: '2px solid var(--rv-border-strong)' }}>
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
                  <div style={{ fontSize: '12px', color: 'var(--rv-text-secondary)', marginTop: '4px' }}>
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity & Note Logging */}
          <div className="rv-lead-drawer__section" style={{ borderBottom: 'none' }}>
            <span className="rv-lead-drawer__label">Add Internal Note</span>

            <form onSubmit={handleAddNoteSubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Log customer conversation or follow-up note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add Note
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
