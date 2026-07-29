import React, { useState } from 'react';
import { PaymentRecord, PaymentStatus } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PaymentDetailDrawerProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onRecordPayment: (paymentId: string, receivedAmount: number, method: string, noteText?: string) => void;
  onMarkFullyPaid: (paymentId: string) => void;
  onAddNote: (paymentId: string, noteText: string) => void;
  canRecordPayment?: boolean;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  onClose,
  onRecordPayment,
  onMarkFullyPaid,
  onAddNote,
  canRecordPayment = true,
}) => {
  const [recordAmountInput, setRecordAmountInput] = useState('');
  const [methodInput, setMethodInput] = useState('UPI (Google Pay / PhonePe)');
  const [noteInput, setNoteInput] = useState('');

  if (!payment) return null;

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRecordPayment) return;
    const amt = parseFloat(recordAmountInput);
    if (isNaN(amt) || amt <= 0) return;
    onRecordPayment(payment.id, amt, methodInput, `Received ₹${amt.toLocaleString('en-IN')} via ${methodInput}`);
    setRecordAmountInput('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(payment.id, noteInput.trim());
    setNoteInput('');
  };

  const getStatusBadgeVariant = (st: PaymentStatus) => {
    switch (st) {
      case 'Paid': return 'completed';
      case 'Partial': return 'job';
      case 'Due Soon': return 'callback';
      case 'Overdue': return 'overdue';
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
        aria-label={`Payment record details for ${payment.paymentCode}`}
      >
        {/* Drawer Header */}
        <div className="rv-lead-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 className="rv-lead-drawer__title">{payment.paymentCode}</h2>
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
            </div>
            <p className="rv-lead-drawer__subtitle">
              {payment.customerName} • {payment.serviceTitle} ({payment.jobCode})
            </p>
          </div>
          <button className="rv-search-clear" onClick={onClose} title="Close drawer">✕</button>
        </div>

        {/* Drawer Content */}
        <div className="rv-lead-drawer__content">
          {/* Financial Breakdown Card */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Ledger Summary</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div style={{ background: 'var(--rv-bg-surface-elevated)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--rv-text-muted)' }}>Total Contract</span>
                <div className="rv-num" style={{ fontWeight: 700, fontSize: '14px' }}>{formatRupees(payment.totalAmount)}</div>
              </div>
              <div style={{ background: 'var(--rv-bg-surface-elevated)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--rv-text-muted)' }}>Amount Collected</span>
                <div className="rv-num" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rv-status-completed-text)' }}>{formatRupees(payment.amountPaid)}</div>
              </div>
              <div style={{ background: 'var(--rv-bg-surface-elevated)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--rv-text-muted)' }}>Balance Outstanding</span>
                <div className="rv-num" style={{ fontWeight: 700, fontSize: '14px', color: payment.balanceDue > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-primary)' }}>{formatRupees(payment.balanceDue)}</div>
              </div>
            </div>

            {payment.balanceDue > 0 && canRecordPayment && (
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--rv-border-subtle)' }}>
                <Button variant="overdue" size="sm" onClick={() => onMarkFullyPaid(payment.id)}>
                  ✓ Mark Fully Paid & Settle
                </Button>
              </div>
            )}
          </div>

          {/* Record Partial / Received Payment Form — Role Guarded */}
          {payment.balanceDue > 0 && (
            <div className="rv-lead-drawer__section">
              <span className="rv-lead-drawer__label">Record Received Payment</span>
              {canRecordPayment ? (
                <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="rv-lead-note-input"
                      placeholder={`Amount in ₹ (max ${payment.balanceDue})`}
                      value={recordAmountInput}
                      onChange={(e) => setRecordAmountInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <select
                      className="rv-lead-note-input"
                      value={methodInput}
                      onChange={(e) => setMethodInput(e.target.value)}
                      style={{ width: '160px' }}
                    >
                      <option value="UPI (Google Pay / PhonePe)">UPI / QR</option>
                      <option value="Cash on Drop">Cash on Drop</option>
                      <option value="Bank NEFT / IMPS">Bank NEFT/IMPS</option>
                      <option value="Corporate Invoice">Corporate Invoice</option>
                    </select>
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    + Record Received Payment
                  </Button>
                </form>
              ) : (
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--rv-bg-surface-elevated)', border: '1px solid var(--rv-border-default)', borderRadius: '6px', fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                  🔒 Payment collection restricted to Accounts & Admin roles.
                </div>
              )}
            </div>
          )}

          {/* Activity & Payment Log */}
          <div className="rv-lead-drawer__section" style={{ borderBottom: 'none' }}>
            <span className="rv-lead-drawer__label">Payment Log & Reminder Notes ({payment.notes.length})</span>

            {/* Quick Add Reminder Note */}
            <form onSubmit={handleAddNoteSubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Log payment reminder or transaction ID..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="sm">
                Add Note
              </Button>
            </form>

            {/* Notes List */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payment.notes.map((n) => (
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
