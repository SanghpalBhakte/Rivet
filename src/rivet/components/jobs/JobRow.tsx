import React from 'react';
import { Job } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface JobRowProps {
  job: Job;
  onSelect: (job: Job) => void;
  onQuickAction: (job: Job, e: React.MouseEvent) => void;
}

export const JobRow: React.FC<JobRowProps> = ({
  job,
  onSelect,
  onQuickAction,
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'scheduled';
      case 'In Progress': return 'active';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'overdue';
      default: return 'neutral';
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'Dispatch';
      case 'In Progress': return 'Complete';
      case 'Completed': return 'View Record';
      case 'Cancelled': return 'Reopen';
      default: return 'Details';
    }
  };

  const hasDue = job.payment.dueAmount && job.payment.dueAmount !== '₹0' && job.payment.dueAmount !== '₹0.00';

  return (
    <div
      className="rv-list-row"
      onClick={() => onSelect(job)}
      role="row"
      style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}
    >
      {/* Top Identity & Status Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={getBadgeVariant(job.status)}>
            {job.status}
          </Badge>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-brand)', fontWeight: 600 }}>
            {job.jobCode}
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {job.customerName}
          </span>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
            {job.customerPhone}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--rv-text-secondary)' }}>
            {job.scheduledDateTime}
          </div>
          <Button
            variant={job.status === 'In Progress' ? 'primary' : 'secondary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction(job, e);
            }}
          >
            {getActionLabel(job.status)}
          </Button>
        </div>
      </div>

      {/* Route Journey & Service Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--rv-border-subtle)', paddingTop: '8px' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rv-text-primary)', marginBottom: '2px' }}>
            {job.serviceTitle}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--rv-text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: 'var(--rv-text-secondary)' }}>📍 {job.pickupLocation}</span>
            <span>➔</span>
            <span style={{ color: 'var(--rv-text-secondary)' }}>🏁 {job.dropLocation}</span>
          </div>
        </div>

        {/* Assigned Driver & Payment Balance */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--rv-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            Driver: <strong style={{ color: 'var(--rv-text-primary)' }}>{job.driverName}</strong> {job.vehicleDetails && `(${job.vehicleDetails})`}
          </div>
          <div>
            Balance: <strong className="rv-num" style={{ color: hasDue ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)' }}>{job.payment.dueAmount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
