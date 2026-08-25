import React from 'react';
import { PaymentRecord } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PaymentRowProps {
  payment: PaymentRecord;
  onSelect: (payment: PaymentRecord) => void;
  onQuickAction: (payment: PaymentRecord, e: React.MouseEvent) => void;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  onSelect,
  onQuickAction,
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'completed';
      case 'Partial': return 'job';
      case 'Due Soon': return 'callback';
      case 'Overdue': return 'overdue';
      default: return 'neutral';
    }
  };

  const formatRupees = (amt: number) => {
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const pctPaid = payment.totalAmount > 0 ? Math.min(100, Math.round((payment.amountPaid / payment.totalAmount) * 100)) : 100;

  return (
    <div
      className="rv-list-row"
      onClick={() => onSelect(payment)}
      role="row"
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant={getBadgeVariant(payment.status)}>
            {payment.status}
          </Badge>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-brand)', fontWeight: 600 }}>
            {payment.paymentCode} • {payment.jobCode}
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {payment.customerName}
          </span>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
            {payment.customerPhone}
          </span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rv-text-primary)' }}>
          {payment.serviceTitle}
        </div>

        {/* Financial Progress & Breakdown */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--rv-text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>Total: <strong className="rv-num" style={{ color: 'var(--rv-text-secondary)' }}>{formatRupees(payment.totalAmount)}</strong></span>
          <span>Paid: <span className="rv-num" style={{ color: 'var(--rv-status-completed-text)' }}>{formatRupees(payment.amountPaid)} ({pctPaid}%)</span></span>
          <span>
            Balance Due:{' '}
            <strong
              className="rv-num"
              style={{
                color: payment.balanceDue > 0 ? (payment.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-primary)') : 'var(--rv-status-completed-text)',
              }}
            >
              {formatRupees(payment.balanceDue)}
            </strong>
          </span>
          <span>Method: {payment.paymentMethod}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="rv-kicker" style={{ fontSize: '10px' }}>Due Date</div>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 500, color: payment.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-secondary)' }}>
            {payment.dueDate}
          </div>
        </div>

        <Button
          variant={payment.status === 'Overdue' ? 'overdue' : payment.status === 'Paid' ? 'secondary' : 'primary'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction(payment, e);
          }}
        >
          {payment.status === 'Paid' ? 'View Details' : 'Record Payment'}
        </Button>
      </div>
    </div>
  );
};
