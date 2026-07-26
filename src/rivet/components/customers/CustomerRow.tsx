import React from 'react';
import { CustomerRecord } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CustomerRowProps {
  customer: CustomerRecord;
  onSelect: (customer: CustomerRecord) => void;
  onQuickAction: (customer: CustomerRecord, e: React.MouseEvent) => void;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  onSelect,
  onQuickAction,
}) => {
  const getBadgeVariant = (health: string) => {
    switch (health) {
      case 'Active Lead': return 'callback';
      case 'Job In Progress': return 'job';
      case 'Payment Due': return 'overdue';
      case 'Repeat Client': return 'completed';
      default: return 'neutral';
    }
  };

  const formatRupees = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  return (
    <li
      className="rv-queue-item rv-customer-row"
      onClick={() => onSelect(customer)}
      style={{ cursor: 'pointer' }}
    >
      {/* Customer Record Info */}
      <div className="rv-queue-item__main">
        <div className="rv-queue-item__meta-row">
          <Badge variant={getBadgeVariant(customer.healthStatus)}>
            {customer.healthStatus.toUpperCase()}
          </Badge>
          <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
            {customer.customerCode}
          </span>
          <span className="rv-queue-item__client">{customer.name}</span>
          <span className="rv-queue-item__phone rv-tabular">{customer.phone}</span>
        </div>

        <h4 className="rv-queue-item__title" style={{ fontWeight: 600, color: 'var(--rv-text-primary)' }}>
          {customer.latestServiceRef}
        </h4>

        {/* Financial & Activity Context */}
        <div className="rv-queue-item__context" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span>City: <strong style={{ color: 'var(--rv-text-secondary)' }}>{customer.city}</strong></span>
          <span>• Lifetime Value: <span className="rv-num">{formatRupees(customer.totalSpent)}</span></span>
          <span>
            • Outstanding Balance:{' '}
            <strong
              className="rv-num"
              style={{
                color: customer.outstandingBalance > 0 ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)',
              }}
            >
              {customer.outstandingBalance > 0 ? formatRupees(customer.outstandingBalance) : 'Settled ₹0'}
            </strong>
          </span>
        </div>
      </div>

      {/* Last Activity & Action CTA */}
      <div className="rv-queue-item__right">
        <div className="rv-queue-item__due">
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Last Contact
          </div>
          <div className="rv-tabular" style={{ fontWeight: 500 }}>
            {customer.lastActivityDate}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction(customer, e);
          }}
        >
          View Timeline
        </Button>
      </div>
    </li>
  );
};
