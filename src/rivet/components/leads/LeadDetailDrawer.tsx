import React, { useState, useEffect } from 'react';
import { Lead, LeadStage } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, newStage: LeadStage) => void;
  onUpdateFollowUp: (leadId: string, newFollowUp: string) => void;
  onUpdateQuote: (leadId: string, amount: string, status: string) => void;
  onAddNote: (leadId: string, noteText: string) => void;
}

const STAGES: LeadStage[] = ['New', 'Contacted', 'Quote Sent', 'Confirmed', 'Closed', 'Lost'];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateStage,
  onUpdateFollowUp,
  onUpdateQuote,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [scheduleDate, setScheduleDate] = useState('2026-08-26');
  const [scheduleTime, setScheduleTime] = useState('11:00');
  const [quoteInput, setQuoteInput] = useState('');

  useEffect(() => {
    if (lead) {
      setQuoteInput(lead.quoteAmount || lead.budget || '');
    }
  }, [lead]);

  if (!lead) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(lead.id, noteInput.trim());
    setNoteInput('');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;
    const formatted = `${scheduleDate} at ${scheduleTime || '10:00 AM'}`;
    onUpdateFollowUp(lead.id, formatted);
  };

  const handleQuoteSave = () => {
    if (!quoteInput.trim()) return;
    onUpdateQuote(lead.id, quoteInput.trim(), `Quote ${quoteInput.trim()} Prepared`);
  };

  // Determine stage progression button
  const renderNextStepAction = () => {
    switch (lead.stage) {
      case 'New':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => onUpdateStage(lead.id, 'Contacted')}
          >
            ✓ Mark Contacted
          </Button>
        );
      case 'Contacted':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => onUpdateStage(lead.id, 'Quote Sent')}
          >
            ✉️ Move to Quote Sent
          </Button>
        );
      case 'Quote Sent':
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => onUpdateStage(lead.id, 'Confirmed')}
            >
              ✓ Convert to Confirmed Booking
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onUpdateStage(lead.id, 'Lost')}
            >
              ✕ Mark Lost
            </Button>
          </div>
        );
      case 'Confirmed':
        return (
          <Button
            variant="secondary"
            size="md"
            onClick={() => onUpdateStage(lead.id, 'Closed')}
          >
            Archive Completed Lead
          </Button>
        );
      case 'Closed':
      case 'Lost':
        return (
          <Button
            variant="secondary"
            size="md"
            onClick={() => onUpdateStage(lead.id, 'Contacted')}
          >
            🔄 Re-open Lead
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rv-drawer-overlay" onClick={onClose}>
      <aside
        className="rv-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Lead details for ${lead.customerName}`}
      >
        {/* Drawer Header */}
        <div className="rv-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Badge variant={lead.stage === 'Quote Sent' ? 'quote' : lead.stage === 'Confirmed' ? 'job' : 'callback'}>
                {lead.stage}
              </Badge>
              <span className="rv-kicker" style={{ fontSize: '11px' }}>{lead.source} INTAKE</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {lead.customerName}
            </h2>
            <div className="rv-mono rv-num" style={{ fontSize: '12px', color: 'var(--rv-text-muted)', marginTop: '2px' }}>
              {lead.customerPhone} {lead.customerEmail && `• ${lead.customerEmail}`}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close drawer">
            ✕
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="rv-drawer__body">
          {/* Action Step Banner */}
          <div style={{ background: 'var(--rv-bg-elevated)', padding: '14px', borderRadius: 'var(--rv-radius-md)', border: '1px solid var(--rv-border-default)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '6px' }}>Current Operational Stage</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                {lead.stage}
              </span>
              {renderNextStepAction()}
            </div>
          </div>

          {/* Service Request Context */}
          <div className="rv-form-group">
            <label className="rv-label">Service Request</label>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--rv-text-primary)' }}>
              {lead.serviceTitle}
            </div>
          </div>

          {/* Quote & Financials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="rv-form-group">
              <label className="rv-label">Budget Range</label>
              <div className="rv-num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-secondary)' }}>
                {lead.budget || 'To Quote'}
              </div>
            </div>

            <div className="rv-form-group">
              <label className="rv-label">Prepared Quote Amount</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="rv-input"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="₹8,500"
                />
                <Button variant="secondary" size="sm" onClick={handleQuoteSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Follow-up Scheduler */}
          <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-subtle)', padding: '14px', borderRadius: 'var(--rv-radius-md)', marginBottom: '18px' }}>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Follow-up Schedule</div>
            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="rv-input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{ flex: '1 1 120px' }}
              />
              <input
                type="time"
                className="rv-input"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{ flex: '1 1 90px' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Update Follow-up
              </Button>
            </form>
          </div>

          {/* Internal Notes History */}
          <div>
            <div className="rv-kicker" style={{ marginBottom: '8px' }}>Internal Notes & History</div>

            <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="rv-input"
                placeholder="Log internal note or call summary..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add Note
              </Button>
            </form>

            <div className="rv-timeline">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes.map((note) => (
                  <div key={note.id} className="rv-timeline-item">
                    <div className="rv-timeline-dot" />
                    <div className="rv-timeline-content">
                      <div className="rv-timeline-title">
                        {note.author}
                      </div>
                      <div className="rv-timeline-desc">
                        {note.text}
                      </div>
                      <div className="rv-timeline-time">
                        {note.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--rv-text-muted)', padding: '8px 0' }}>
                  No internal notes logged for this lead yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
