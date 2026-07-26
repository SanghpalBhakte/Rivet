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

  // Stage update handler
  const handleUpdateStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stage: newStage } : null));
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
        title="Leads Pipeline"
        subline="Janai Tours & Service Ops • Active customer inquiries and booking quotes"
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
              placeholder="Search customer name, phone, service package..."
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
                onPrimaryAction={(selected) => setSelectedLead(selected)}
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
        onAddNote={handleAddNote}
      />
    </div>
  );
};
