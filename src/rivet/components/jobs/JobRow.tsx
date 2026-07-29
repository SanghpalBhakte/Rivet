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
      case 'Scheduled': return '🚗 Dispatch Vehicle';
      case 'In Progress': return '✓ Mark Completed';
      case 'Completed': return '📄 View Work Order';
      case 'Cancelled': return '🔄 Reopen Job';
      default: return 'View Details';
    }
  };

  return (
    <li
      className="rv-queue-item rv-job-row"
      onClick={() => onSelect(job)}
      style={{
        cursor: 'pointer',
        padding: '12px 16px',
        background: 'var(--rv-bg-surface)',
        border: '1px solid var(--rv-border-subtle)',
        borderRadius: 'var(--rv-radius-md)',
        marginBottom: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Top Identity & Status Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={getBadgeVariant(job.status)}>
            {job.status.toUpperCase()}
          </Badge>
          <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
            {job.jobCode}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {job.customerName}
          </span>
          <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-dim)' }}>
            ({job.customerPhone})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
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

      {/* Middle Service & Route Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px dashed var(--rv-border-subtle)', paddingTop: '6px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {job.serviceTitle}
          </h4>
          <div style={{ fontSize: '11px', color: 'var(--rv-text-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>📍 <strong>{job.pickupLocation}</strong></span>
            <span>➔</span>
            <span>🏁 <strong>{job.dropLocation}</strong></span>
          </div>
        </div>

        {/* Driver, Vehicle & Payment Snapshot */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--rv-text-muted)', alignItems: 'center' }}>
          <div>
            Driver: <strong style={{ color: 'var(--rv-text-primary)' }}>{job.driverName}</strong> ({job.vehicleDetails})
          </div>
          <div>
            Balance: <strong className="rv-num" style={{ color: job.payment.dueAmount !== '₹0' ? 'var(--rv-status-overdue-text)' : 'var(--rv-status-completed-text)' }}>{job.payment.dueAmount}</strong>
          </div>
        </div>
      </div>
    </li>
  );
};

