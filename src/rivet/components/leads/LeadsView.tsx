import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_LEADS } from '../../data/mockData';
import { Lead, LeadStage, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { LeadRow } from './LeadRow';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { NewInquiryModal } from './NewInquiryModal';
import { Button } from '../ui/Button';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LeadsView: React.FC = () => {
  const { user, can } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);

  useEffect(() => {
    ApiService.getLeads().then(setLeads);
  }, []);

  // Stage transition workflow handler
  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    if (!can('lead:update_stage')) {
      alert(`Role "${user?.role}" does not have permission to update lead stages.`);
      return;
    }
    ApiService.updateLeadStage(leadId, newStage, actor).then(setLeads).catch(console.error);
  };

  // Follow-up date/time schedule handler
  const handleScheduleFollowUp = (leadId: string, nextTime: string) => {
    ApiService.updateLeadDetails(leadId, { nextFollowUp: nextTime })
      .then((updated) => {
        setLeads(updated);
        const found = updated.find((l) => l.id === leadId) || null;
        if (selectedLead?.id === leadId) setSelectedLead(found);
      })
      .catch(console.error);
  };

  // Quote amount update handler
  const handleUpdateQuote = (leadId: string, amount: string, status: string) => {
    ApiService.updateLeadDetails(leadId, { quoteAmount: amount, quoteStatus: status || `Quote ${amount} Prepared` })
      .then((updated) => {
        setLeads(updated);
        const found = updated.find((l) => l.id === leadId) || null;
        if (selectedLead?.id === leadId) setSelectedLead(found);
      })
      .catch(console.error);
  };

  // Add Note handler
  const handleAddNote = (leadId: string, text: string) => {
    ApiService.addNote(leadId, 'Lead', text)
      .then((newNote) => {
        setLeads((prev) =>
          prev.map((l) => {
            if (l.id !== leadId) return l;
            const updated = { ...l, notes: [newNote, ...l.notes] };
            if (selectedLead?.id === leadId) setSelectedLead(updated);
            return updated;
          })
        );
      })
      .catch(console.error);
  };

  // Quick Action click from list row
  const handleQuickAction = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.stage === 'New') handleStageChange(lead.id, 'Contacted');
    else if (lead.stage === 'Contacted') handleStageChange(lead.id, 'Quote Sent');
    else if (lead.stage === 'Quote Sent') handleStageChange(lead.id, 'Confirmed');
    else if (lead.stage === 'Confirmed') handleStageChange(lead.id, 'Closed');
    else setSelectedLead(lead);
  };

  // Add new lead intake handler — persists to Supabase
  const handleAddLead = (newLead: Lead) => {
    ApiService.createLead(newLead)
      .then((updated) => {
        setLeads(updated);
        // Select the first (newest) lead returned
        const created = updated.find(
          (l) => l.customerPhone === newLead.customerPhone && l.serviceTitle === newLead.serviceTitle
        );
        setSelectedLead(created || null);
      })
      .catch(console.error);
  };

  // Filter leads by search query and stage tab
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStage = stageFilter === 'All' || lead.stage === stageFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.customerName.toLowerCase().includes(q) ||
        lead.customerPhone.toLowerCase().includes(q) ||
        lead.serviceTitle.toLowerCase().includes(q) ||
        lead.source.toLowerCase().includes(q) ||
        lead.assignee.toLowerCase().includes(q);
      return matchesStage && matchesSearch;
    });
  }, [leads, stageFilter, searchQuery]);

  // Stage counts for pipeline filter tabs
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
        title="Leads & Inquiry Management"
        subline="Janai Tours & Service Ops • List-first workflow for incoming service inquiries"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Main Leads Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search, Filter & New Inquiry Action Bar */}
        <div className="rv-leads-bar">
          {/* Search Input */}
          <div className="rv-search-wrapper">
            <span className="rv-search-icon">🔍</span>
            <input
              type="text"
              className="rv-search-input"
              placeholder="Search customer name, phone, trip service, source, or assignee..."
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

          {/* New Inquiry Action Button — Role Guarded */}
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (!can('lead:create')) {
                alert(`Role "${user?.role}" cannot create new inquiries. Contact an Admin or Operations desk.`);
                return;
              }
              setIsNewInquiryOpen(true);
            }}
            disabled={!can('lead:create')}
            title={!can('lead:create') ? `Role (${user?.role}) restricted from creating leads` : 'Create new lead inquiry'}
            style={{ whiteSpace: 'nowrap', opacity: can('lead:create') ? 1 : 0.6 }}
          >
            ⚡ + New Inquiry
          </Button>

          {/* Stage Filter Pills */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter leads by pipeline stage">
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

        {/* Leads List / Table */}
        {simMode === 'loading' ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : simMode === 'empty' || filteredLeads.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No leads match your filter"
            description="Try clearing your search query or selecting a different stage tab."
          />
        ) : (
          <ul className="rv-queue-list" role="list">
            {filteredLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onSelect={(selected) => setSelectedLead(selected)}
                onQuickAction={handleQuickAction}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStage={handleStageChange}
        onUpdateFollowUp={handleScheduleFollowUp}
        onUpdateQuote={handleUpdateQuote}
        onAddNote={handleAddNote}
      />

      {/* New Inquiry Intake Helper Modal */}
      <NewInquiryModal
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
        onAddLead={handleAddLead}
      />
    </div>
  );
};
