import React, { useState } from 'react';
import { PaymentRecord, PaymentStatus } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PaymentDetailDrawerProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onRecordPayment: (paymentId: string, receivedAmount: number, method: string, noteText?: string) => void;
  onAddNote: (paymentId: string, noteText: string) => void;
  canRecordPayment?: boolean;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  onClose,
  onRecordPayment,
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
  const pctPaid = payment.totalAmount > 0 ? Math.min(100, Math.round((payment.amountPaid / payment.totalAmount) * 100)) : 100;

  return (
    <div className="rv-drawer-overlay" onClick={onClose}>
      <aside
        className="rv-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Payment record details for ${payment.paymentCode}`}
      >
        {/* Header */}
        <div className="rv-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
              <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-brand)', fontWeight: 600 }}>
                {payment.paymentCode}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {payment.customerName}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
              {payment.serviceTitle} ({payment.jobCode})
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close drawer">
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="rv-drawer__body">
          {/* Financial Breakdown Card */}
          <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '16px', borderRadius: 'var(--rv-radius-md)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '10px' }}>Ledger Balance Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Total Amount</div>
                <div className="rv-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>{formatRupees(payment.totalAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Collected</div>
                <div className="rv-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--rv-status-completed-text)' }}>{formatRupees(payment.amountPaid)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Remaining Due</div>
                <div className="rv-num" style={{ fontSize: '15px', fontWeight: 600, color: payment.balanceDue > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-muted)' }}>
                  {formatRupees(payment.balanceDue)}
                </div>
              </div>
            </div>

            {/* Progress Track */}
            <div className="rv-pipeline-track" style={{ height: '6px' }}>
              <div
                className="rv-pipeline-fill"
                style={{
                  width: `${pctPaid}%`,
                  backgroundColor: payment.balanceDue === 0 ? 'var(--rv-status-completed-text)' : 'var(--rv-brand)',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--rv-text-dim)', textAlign: 'right', marginTop: '4px' }}>
              {pctPaid}% Settled
            </div>
          </div>

          {/* Payment Collection Action */}
          {payment.balanceDue > 0 && canRecordPayment && (
            <div style={{ background: 'var(--rv-bg-elevated)', padding: '14px', borderRadius: 'var(--rv-radius-md)', border: '1px solid var(--rv-border-default)', marginBottom: '18px' }}>
              <div className="rv-kicker" style={{ marginBottom: '8px' }}>Record Incoming Collection</div>
              <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="rv-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="rv-input"
                      placeholder={payment.balanceDue.toString()}
                      value={recordAmountInput}
                      onChange={(e) => setRecordAmountInput(e.target.value)}
                      required
                      min="1"
                      max={payment.balanceDue}
                    />
                  </div>
                  <div>
                    <label className="rv-label">Payment Method</label>
                    <select
                      className="rv-select"
                      value={methodInput}
                      onChange={(e) => setMethodInput(e.target.value)}
                    >
                      <option value="UPI (Google Pay / PhonePe)">UPI (GPay / PhonePe)</option>
                      <option value="Cash">Cash on Delivery</option>
                      <option value="Bank NEFT / IMPS">Bank Transfer</option>
                      <option value="Credit / Debit Card">Card POS</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" variant="primary" size="md">
                  + Record ₹{recordAmountInput || payment.balanceDue} Payment
                </Button>
              </form>
            </div>
          )}

          {/* Payment Notes */}
          <div>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Payment Ledger Notes</div>
            <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="rv-input"
                placeholder="Log receipt ref, transaction ID, bank note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add Note
              </Button>
            </form>

            <div className="rv-timeline">
              {payment.notes && payment.notes.length > 0 ? (
                payment.notes.map((note) => (
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
                  No payment notes recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
