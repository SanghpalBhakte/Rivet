import React, { useState, useMemo } from 'react';
import { INITIAL_LEADS, INITIAL_PIPELINE_STAGES } from '../../data/mockData';
import { Lead, LeadStage, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { PipelineStrip } from '../ui/PipelineStrip';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { LeadRow } from './LeadRow';
import { LeadDetailDrawer } from './LeadDetailDrawer';

export const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');

  // Filter leads by search term and stage filter
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStage = stageFilter === 'All' || lead.stage === stageFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.customerName.toLowerCase().includes(q) ||
        lead.customerPhone.toLowerCase().includes(q) ||
        lead.serviceTitle.toLowerCase().includes(q) ||
        lead.assignee.toLowerCase().includes(q);
      return matchesStage && matchesSearch;
    });
  }, [leads, stageFilter, searchQuery]);

  // Stage progression step logic
  const advanceLeadStage = (lead: Lead) => {
    let nextStage: LeadStage = lead.stage;
    switch (lead.stage) {
      case 'New': nextStage = 'Contacted'; break;
      case 'Contacted': nextStage = 'Quote Sent'; break;
      case 'Quote Sent': nextStage = 'Confirmed'; break;
      case 'Confirmed': nextStage = 'Closed'; break;
      case 'Closed': nextStage = 'Contacted'; break;
      case 'Lost': nextStage = 'Contacted'; break;
    }
    handleUpdateStage(lead.id, nextStage);
  };

  // Stage update handler
  const handleUpdateStage = (leadId: string, newStage: LeadStage) => {
    const stageNoteText = `Stage updated to ${newStage}`;
    const newNote = {
      id: `n-${Date.now()}`,
      author: 'System',
      timestamp: 'Just now',
      text: stageNoteText,
    };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, stage: newStage, notes: [newNote, ...l.notes] }
          : l
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? { ...prev, stage: newStage, notes: [newNote, ...prev.notes] }
          : null
      );
    }
  };

  // Follow-up scheduling update handler
  const handleUpdateFollowUp = (leadId: string, newFollowUp: string) => {
    const scheduleNoteText = `Next follow-up scheduled for: ${newFollowUp}`;
    const newNote = {
      id: `n-${Date.now()}`,
      author: 'Janai Desk',
      timestamp: 'Just now',
      text: scheduleNoteText,
    };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, nextFollowUp: newFollowUp, notes: [newNote, ...l.notes] }
          : l
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? { ...prev, nextFollowUp: newFollowUp, notes: [newNote, ...prev.notes] }
          : null
      );
    }
  };

  // Quote amount & status update handler
  const handleUpdateQuote = (leadId: string, amount: string, status: string) => {
    const quoteNoteText = `Quote saved: ${amount} (${status})`;
    const newNote = {
      id: `n-${Date.now()}`,
      author: 'Janai Desk',
      timestamp: 'Just now',
      text: quoteNoteText,
    };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              quoteAmount: amount,
              quoteStatus: status,
              notes: [newNote, ...l.notes],
            }
          : l
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              quoteAmount: amount,
              quoteStatus: status,
              notes: [newNote, ...prev.notes],
            }
          : null
      );
    }
  };

  // Add note handler
  const handleAddNote = (leadId: string, noteText: string) => {
    const newNote = {
      id: `n-${Date.now()}`,
      author: 'Janai Desk',
      timestamp: 'Just now',
      text: noteText,
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: [newNote, ...l.notes] } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
      );
    }
  };

  // Stage counts for tab badges
  const getStageCount = (st: 'All' | LeadStage) => {
    if (st === 'All') return leads.length;
    return leads.filter((l) => l.stage === st).length;
  };

  const STAGE_FILTERS: ('All' | LeadStage)[] = [
    'All',
    'New',
    'Contacted',
    'Quote Sent',
    'Confirmed',
    'Closed',
    'Lost',
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Leads Operations"
        subline="Janai Tours & Service Ops • Operational lead progression & quote scheduling"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Pipeline Stage Summary Strip */}
      <PipelineStrip stages={INITIAL_PIPELINE_STAGES} simMode={simMode} />

      {/* Leads List Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search & Filter Bar */}
        <div className="rv-leads-bar">
          {/* Search Input */}
          <div className="rv-search-wrapper">
            <span className="rv-search-icon">🔍</span>
            <input
              type="text"
              className="rv-search-input"
              placeholder="Search customer name, phone, package, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="rv-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stage Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter leads by stage">
            {STAGE_FILTERS.map((st) => (
              <button
                key={st}
                className={`rv-queue-tab ${stageFilter === st ? 'rv-queue-tab--active' : ''}`}
                onClick={() => setStageFilter(st)}
                role="tab"
                aria-selected={stageFilter === st}
              >
                <span>{st}</span>
                <span className="rv-queue-tab__count rv-num">{getStageCount(st)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table / List */}
        {simMode === 'loading' ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : simMode === 'empty' || filteredLeads.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No leads match your filter"
            description="Try clearing your search query or selecting a different pipeline stage tab."
          />
        ) : (
          <ul className="rv-queue-list" role="list">
            {filteredLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onSelect={(selected) => setSelectedLead(selected)}
                onQuickAction={(leadToAdvance) => advanceLeadStage(leadToAdvance)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Lead Detail Panel / Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStage={handleUpdateStage}
        onUpdateFollowUp={handleUpdateFollowUp}
        onUpdateQuote={handleUpdateQuote}
        onAddNote={handleAddNote}
      />
    </div>
  );
};
