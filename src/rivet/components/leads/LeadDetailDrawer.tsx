import React, { useState } from 'react';
import { Lead, LeadStage } from '../../types/rivet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStage: (leadId: string, newStage: LeadStage) => void;
  onAddNote: (leadId: string, noteText: string) => void;
}

const STAGES: LeadStage[] = ['New', 'Contacted', 'Quote Sent', 'Confirmed', 'Closed', 'Lost'];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateStage,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');

  if (!lead) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(lead.id, noteInput.trim());
    setNoteInput('');
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
          {/* Service Request & Budget */}
          <div className="rv-lead-drawer__section">
            <span className="rv-lead-drawer__label">Service Request</span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
              {lead.serviceTitle}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' }}>
              <div>
                <span className="rv-text-muted">Budget: </span>
                <strong className="rv-num">{lead.budget}</strong>
              </div>
              <div>
                <span className="rv-text-muted">Created: </span>
                <span className="rv-num">{lead.createdAt}</span>
              </div>
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
            <span className="rv-lead-drawer__label">Pipeline Stage</span>
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
