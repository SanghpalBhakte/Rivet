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
  const [scheduleDate, setScheduleDate] = useState('2026-07-28');
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
            ✉️ Send Quote & Move to Quote Sent
          </Button>
        );
      case 'Quote Sent':
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="overdue"
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
            variant="primary"
            size="md"
            onClick={() => onUpdateStage(lead.id, 'Closed')}
          >
            🎉 Close & Archive Lead
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
    <div className="rv-lead-drawer-overlay" onClick={onClose}>
      <div
        className="rv-lead-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Lead details for ${lead.customerName}`}
      >
        {/* Drawer Header */}
        <div className="rv-lead-drawer__header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="neutral">{lead.source}</Badge>
              <span className="rv-tabular" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
                ID: {lead.id}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              {lead.customerName}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close lead detail panel">
            ✕
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="rv-lead-drawer__body">
          {/* Stage Progression Action Hero Slot */}
          <div className="rv-lead-drawer__section" style={{ background: 'var(--rv-bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--rv-border-default)' }}>
            <span className="rv-lead-drawer__label" style={{ marginBottom: '6px' }}>Current Stage Action</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div>
                <span className="rv-text-muted">Status: </span>
                <strong style={{ color: 'var(--rv-text-primary)' }}>{lead.stage}</strong>
              </div>
              {renderNextStepAction()}
            </div>
          </div>

          {/* Follow-up Scheduling Flow */}
          <div className="rv-lead-drawer__section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="rv-lead-drawer__label">Next Follow-up Schedule</span>
              <span className="rv-num" style={{ fontSize: '11px', color: 'var(--rv-status-callback-text)', fontWeight: 500 }}>
                {lead.nextFollowUp}
              </span>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="rv-lead-note-input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{ flex: 1, minWidth: '120px' }}
              />
              <input
                type="time"
                className="rv-lead-note-input"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{ width: '90px' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Schedule
              </Button>
            </form>
          </div>

          {/* Quote Status & Budget Breakdown */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Service Quote Details</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '4px' }}>
              {lead.serviceTitle}
            </div>

            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div>
                <span className="rv-text-muted">Target Budget: </span>
                <strong className="rv-num">{lead.budget}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Quote Status: </span>
                <span className="rv-num" style={{ color: 'var(--rv-text-primary)' }}>{lead.quoteStatus || 'Not Sent'}</span>
              </div>
            </div>

            {/* Quick Quote Editor */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Enter quote amount (e.g. ₹48,000)"
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
              />
              <Button variant="secondary" size="sm" onClick={handleQuoteSave}>
                Save Quote
              </Button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Customer Contact</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '13px' }}>
              <div>
                <span className="rv-text-muted">Phone: </span>
                <strong className="rv-num">{lead.customerPhone}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Email: </span>
                <span>{lead.customerEmail}</span>
              </div>
              <div>
                <span className="rv-text-muted">Assigned Owner: </span>
                <span>{lead.assignee}</span>
              </div>
            </div>
          </div>

          {/* Pipeline Stage Switcher */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Override Pipeline Stage</span>
            <div className="rv-stage-selector" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {STAGES.map((st) => (
                <button
                  key={st}
                  className={`rv-stage-pill ${lead.stage === st ? 'rv-stage-pill--active' : ''}`}
                  onClick={() => onUpdateStage(lead.id, st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Activity & Notes Log */}
          <div className="rv-lead-drawer__section" style={{ borderBottom: 'none' }}>
            <span className="rv-lead-drawer__label">Activity & Internal Notes ({lead.notes.length})</span>

            {/* Quick Add Note Input */}
            <form onSubmit={handleAddNoteSubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="Log internal note or call summary..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
            </form>

            {/* Notes List */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lead.notes.map((n) => (
                <div key={n.id} className="rv-lead-note-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--rv-text-muted)', marginBottom: '2px' }}>
                    <strong style={{ color: 'var(--rv-text-secondary)' }}>{n.author}</strong>
                    <span className="rv-num">{n.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--rv-text-primary)' }}>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
