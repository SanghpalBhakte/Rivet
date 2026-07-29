import React from 'react';
import { Lead } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeadRowProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onQuickAction: (lead: Lead, e: React.MouseEvent) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  onSelect,
  onQuickAction,
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

  // Determine stage-based action CTA label
  const getStageActionLabel = (stage: string) => {
    switch (stage) {
      case 'New': return 'Mark Contacted';
      case 'Contacted': return 'Send Quote';
      case 'Quote Sent': return 'Mark Confirmed';
      case 'Confirmed': return 'Mark Closed';
      case 'Closed': return 'Reopen Lead';
      case 'Lost': return 'Reopen Lead';
      default: return 'Advance Stage';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Badge variant={getBadgeVariant(lead.stage)}>
            {lead.stage.toUpperCase()}
          </Badge>
          <span className="rv-queue-item__client" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-secondary)' }}>{lead.customerName}</span>
          <span className="rv-queue-item__phone rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>{lead.customerPhone}</span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-dim)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>{lead.source}</span>
        </div>

        <h4 className="rv-queue-item__title" style={{ margin: 0, marginBottom: '2px', fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
          {lead.serviceTitle}
        </h4>

        {/* Scannable Quote Status & Budget */}
        <div className="rv-queue-item__context" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span>Budget: <strong className="rv-num" style={{ color: 'var(--rv-text-secondary)' }}>{lead.budget}</strong></span>
          {lead.quoteStatus && (
            <span style={{ color: lead.stage === 'Quote Sent' ? 'var(--rv-status-overdue-text)' : 'var(--rv-text-muted)' }}>
              • {lead.quoteStatus}
            </span>
          )}
          <span>• Owner: {lead.assignee}</span>
        </div>
      </div>

      {/* Schedule & Compact Quick Action CTA */}
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
            onQuickAction(lead, e);
          }}
          title={`Action for stage ${lead.stage}`}
        >
          {getStageActionLabel(lead.stage)}
        </Button>
      </div>
    </li>
  );
};
