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
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  onClose,
  onRecordPayment,
  onMarkFullyPaid,
  onAddNote,
}) => {
  const [recordAmountInput, setRecordAmountInput] = useState('');
  const [methodInput, setMethodInput] = useState('UPI (Google Pay / PhonePe)');
  const [noteInput, setNoteInput] = useState('');

  if (!payment) return null;

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status.toUpperCase()}</Badge>
              <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
                {payment.paymentCode} • {payment.jobCode}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {payment.customerName}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close payment drawer">
            ✕
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="rv-lead-drawer__body">
          {/* Service Title */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Service / Work Order Reference</span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
              {payment.serviceTitle}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rv-text-muted)', marginTop: '4px' }}>
              Customer Phone: <span className="rv-num">{payment.customerPhone}</span>
            </div>
          </div>

          {/* Scannable Financial Summary Card */}
          <div className="rv-lead-drawer__section" style={{ background: 'var(--rv-bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--rv-border-default)' }}>
            <span className="rv-lead-drawer__label" style={{ marginBottom: '6px' }}>Financial Breakdown</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginTop: '6px' }}>
              <div>
                <span className="rv-text-muted">Total Amount: </span>
                <strong className="rv-num">{formatRupees(payment.totalAmount)}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Amount Paid: </span>
                <span className="rv-num" style={{ color: 'var(--rv-status-completed-text)', fontWeight: 600 }}>
                  {formatRupees(payment.amountPaid)}
                </span>
              </div>
              <div>
                <span className="rv-text-muted">Balance Due: </span>
                <strong
                  className="rv-num"
                  style={{
                    color: payment.balanceDue > 0 ? (payment.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-primary)') : 'var(--rv-text-muted)',
                  }}
                >
                  {formatRupees(payment.balanceDue)}
                </strong>
              </div>
              <div>
                <span className="rv-text-muted">Due Date: </span>
                <span className="rv-num">{payment.dueDate}</span>
              </div>
            </div>

            {payment.balanceDue > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--rv-border-subtle)' }}>
                <Button variant="overdue" size="sm" onClick={() => onMarkFullyPaid(payment.id)}>
                  ✓ Mark Fully Paid & Settle
                </Button>
              </div>
            )}
          </div>

          {/* Record Partial / Received Payment Form */}
          {payment.balanceDue > 0 && (
            <div className="rv-lead-drawer__section">
              <span className="rv-lead-drawer__label">Record Received Payment</span>
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
