import React from 'react';
import { Lead } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeadRowProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onPrimaryAction: (lead: Lead, e: React.MouseEvent) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  onSelect,
  onPrimaryAction,
}) => {
  const getBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'New': return 'callback';
      case 'Contacted': return 'neutral';
      case 'Quote Sent': return 'overdue';
      case 'Confirmed': return 'job';
      case 'Closed': return 'completed';
      default: return 'neutral';
    }
  };

  return (
    <li
      className="rv-queue-item rv-lead-row"
      onClick={() => onSelect(lead)}
      style={{ cursor: 'pointer' }}
    >
      {/* Customer Info & Service Request */}
      <div className="rv-queue-item__main">
        <div className="rv-queue-item__meta-row">
          <Badge variant={getBadgeVariant(lead.stage)}>
            {lead.stage.toUpperCase()}
          </Badge>
          <Badge variant="neutral">
            {lead.source}
          </Badge>
          <span className="rv-queue-item__client">{lead.customerName}</span>
          <span className="rv-queue-item__phone rv-tabular">{lead.customerPhone}</span>
        </div>

        <h4 className="rv-queue-item__title" style={{ fontWeight: 600, color: 'var(--rv-text-primary)' }}>
          {lead.serviceTitle}
        </h4>

        <div className="rv-queue-item__context">
          Budget: <span className="rv-tabular" style={{ color: 'var(--rv-text-secondary)', fontWeight: 500 }}>{lead.budget}</span> • Owner: {lead.assignee}
        </div>
      </div>

      {/* Schedule & Action CTA */}
      <div className="rv-queue-item__right">
        <div className="rv-queue-item__due">
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Next Follow-up
          </div>
          <div className="rv-tabular" style={{ fontWeight: 500 }}>
            {lead.nextFollowUp}
          </div>
        </div>

        <Button
          variant={lead.stage === 'Quote Sent' ? 'overdue' : 'secondary'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onPrimaryAction(lead, e);
          }}
        >
          {lead.primaryActionLabel}
        </Button>
      </div>
    </li>
  );
};
