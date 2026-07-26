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
      case 'Scheduled': return 'callback';
      case 'In Progress': return 'job';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'overdue';
      default: return 'neutral';
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'Dispatch Vehicle';
      case 'In Progress': return 'Mark Completed';
      case 'Completed': return 'View Work Order';
      case 'Cancelled': return 'Reopen Job';
      default: return 'View Details';
    }
  };

  return (
    <li
      className="rv-queue-item rv-job-row"
      onClick={() => onSelect(job)}
      style={{ cursor: 'pointer' }}
    >
      {/* Work Order Info */}
      <div className="rv-queue-item__main">
        <div className="rv-queue-item__meta-row">
          <Badge variant={getBadgeVariant(job.status)}>
            {job.status.toUpperCase()}
          </Badge>
          <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
            {job.jobCode}
          </span>
          <span className="rv-queue-item__client">{job.customerName}</span>
          <span className="rv-queue-item__phone rv-tabular">{job.customerPhone}</span>
        </div>

        <h4 className="rv-queue-item__title" style={{ fontWeight: 600, color: 'var(--rv-text-primary)' }}>
          {job.serviceTitle}
        </h4>

        {/* Dispatch & Payment Snapshot Info */}
        <div className="rv-queue-item__context" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span>Driver: <strong style={{ color: 'var(--rv-text-secondary)' }}>{job.driverName}</strong></span>
          <span>• Vehicle: {job.vehicleDetails}</span>
          <span>• Due: <strong className="rv-num" style={{ color: job.payment.dueAmount !== '₹0' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-muted)' }}>{job.payment.dueAmount}</strong></span>
        </div>
      </div>

      {/* Schedule & Action CTA */}
      <div className="rv-queue-item__right">
        <div className="rv-queue-item__due">
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Scheduled Time
          </div>
          <div className="rv-tabular" style={{ fontWeight: 500 }}>
            {job.scheduledDateTime}
          </div>
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
    </li>
  );
};
