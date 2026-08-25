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
      case 'Quote Sent': return 'quote';
      case 'Confirmed': return 'job';
      case 'Closed': return 'completed';
      default: return 'neutral';
    }
  };

  const getStageActionLabel = (stage: string) => {
    switch (stage) {
      case 'New': return 'Mark Contacted';
      case 'Contacted': return 'Prepare Quote';
      case 'Quote Sent': return 'Confirm Booking';
      case 'Confirmed': return 'Archive Lead';
      case 'Closed': return 'Reopen';
      case 'Lost': return 'Reopen';
      default: return 'Advance Stage';
    }
  };

  return (
    <div
      className="rv-list-row"
      onClick={() => onSelect(lead)}
      role="row"
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant={getBadgeVariant(lead.stage)}>
            {lead.stage}
          </Badge>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            {lead.customerName}
          </span>
          <span className="rv-mono rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
            {lead.customerPhone}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-dim)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>{lead.source}</span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rv-text-primary)' }}>
          {lead.serviceTitle}
        </div>

        <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--rv-text-muted)', flexWrap: 'wrap' }}>
          <span>Budget: <strong className="rv-num" style={{ color: 'var(--rv-text-secondary)' }}>{lead.budget}</strong></span>
          {lead.quoteAmount && (
            <span>Quote: <strong className="rv-num" style={{ color: 'var(--rv-brand)' }}>{lead.quoteAmount}</strong></span>
          )}
          <span>Owner: {lead.assignee}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="rv-kicker" style={{ fontSize: '10px' }}>Follow-up</div>
          <div className="rv-num" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--rv-text-secondary)' }}>
            {lead.nextFollowUp || 'None'}
          </div>
        </div>

        <Button
          variant={lead.stage === 'Quote Sent' ? 'primary' : 'secondary'}
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
    </div>
  );
};
