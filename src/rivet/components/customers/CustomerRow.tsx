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
  const hasBalance = customer.outstandingBalance > 0;

  return (
    <div
      className="rv-list-row"
      onClick={() => onSelect(customer)}
      role="row"
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant={getBadgeVariant(customer.healthStatus)}>
            {customer.healthStatus}
          </Badge>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-brand)', fontWeight: 600 }}>
            {customer.customerCode}
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {customer.name}
          </span>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
            {customer.phone}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-dim)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>{customer.city}</span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rv-text-primary)' }}>
          {customer.latestServiceRef || 'Active Account'}
        </div>

        {/* Spend & Balance */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--rv-text-muted)', flexWrap: 'wrap' }}>
          <span>Lifetime Value: <strong className="rv-num" style={{ color: 'var(--rv-text-secondary)' }}>{formatRupees(customer.totalSpent)}</strong></span>
          <span>
            Outstanding:{' '}
            <strong
              className="rv-num"
              style={{
                color: hasBalance ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)',
              }}
            >
              {hasBalance ? formatRupees(customer.outstandingBalance) : 'Settled ₹0'}
            </strong>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="rv-kicker" style={{ fontSize: '10px' }}>Last Active</div>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--rv-text-secondary)' }}>
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
          Open Hub
        </Button>
      </div>
    </div>
  );
};
