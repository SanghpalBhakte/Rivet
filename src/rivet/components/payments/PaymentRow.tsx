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

  return (
    <li
      className="rv-queue-item rv-payment-row"
      onClick={() => onSelect(payment)}
      style={{ cursor: 'pointer' }}
    >
      {/* Payment Record Info */}
      <div className="rv-queue-item__main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Badge variant={getBadgeVariant(payment.status)}>
            {payment.status.toUpperCase()}
          </Badge>
          <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
            {payment.paymentCode} • {payment.jobCode}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-dim)' }}>•</span>
          <span className="rv-queue-item__client" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-secondary)' }}>{payment.customerName}</span>
        </div>

        <h4 className="rv-queue-item__title" style={{ margin: 0, marginBottom: '2px', fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
          {payment.serviceTitle}
        </h4>

        {/* Amount Breakdown & Payment Method */}
        <div className="rv-queue-item__context" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span>Total: <strong className="rv-num">{formatRupees(payment.totalAmount)}</strong></span>
          <span>• Paid: <span className="rv-num">{formatRupees(payment.amountPaid)}</span></span>
          <span>
            • Balance Due:{' '}
            <strong
              className="rv-num"
              style={{
                color: payment.balanceDue > 0 ? (payment.status === 'Overdue' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-primary)') : 'var(--rv-status-completed-text)',
              }}
            >
              {formatRupees(payment.balanceDue)}
            </strong>
          </span>
          <span>• Method: {payment.paymentMethod}</span>
        </div>
      </div>

      {/* Due Date & Action CTA */}
      <div className="rv-queue-item__right">
        <div className="rv-queue-item__due">
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Due Date
          </div>
          <div className="rv-tabular" style={{ fontWeight: 500 }}>
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
    </li>
  );
};
