import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStage } from '../../types/rivet';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    ApiService.getLeads(user?.workspaceId)
      .then(setLeads)
      .finally(() => setLoading(false));
  }, [user?.workspaceId]);

  // Stage transition workflow handler — connects Confirmed leads directly to Dispatch Jobs
  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    if (!can('lead:update_stage')) {
      alert(`Role "${user?.role}" does not have permission to update lead stages.`);
      return;
    }
    const targetLead = leads.find((l) => l.id === leadId);
    if (newStage === 'Confirmed' && targetLead) {
      const numAmt = parseFloat((targetLead.quoteAmount || targetLead.budget || '2500').replace(/[^0-9.]/g, '')) || 2500;
      ApiService.convertLeadToJob(
        targetLead,
        targetLead.nextFollowUp || 'Today, 5:00 PM',
        'Central HQ Depot',
        'Client Location',
        numAmt,
        actor
      ).then(setLeads).catch(console.error);
    } else {
      ApiService.updateLeadStage(leadId, newStage, actor).then(setLeads).catch(console.error);
    }
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
    ApiService.createLead(newLead, user?.workspaceId, actor)
      .then((updated) => {
        setLeads(updated);
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

  const STAGE_FILTERS: ('All' | LeadStage)[] = [
    'All',
    'New',
    'Contacted',
    'Quote Sent',
    'Confirmed',
    'Closed',
  ];

  const getStageCount = (st: 'All' | LeadStage) => {
    if (st === 'All') return leads.length;
    return leads.filter((l) => l.stage === st).length;
  };

  return (
    <div>
      <PageHeader
        kicker="Sales & Intake"
        title="Leads & Quotes"
        subline="WhatsApp intake parsing, quote management, and booking confirmations"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewInquiryOpen(true)}
          >
            + New Intake
          </Button>
        }
      />

      <div className="rv-table-container">
        <div className="rv-table-header">
          {/* Stage Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter leads by stage">
            {STAGE_FILTERS.map((st) => {
              const count = getStageCount(st);
              const isActive = stageFilter === st;
              return (
                <button
                  key={st}
                  className={`rv-queue-tab ${isActive ? 'rv-queue-tab--active' : ''}`}
                  onClick={() => setStageFilter(st)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{st}</span>
                  <span className="rv-queue-tab__count rv-num">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="rv-search-bar">
            <span style={{ color: 'var(--rv-text-muted)', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search leads, phone, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Lead List Rows */}
        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon="📋"
            title={leads.length === 0 ? "No Leads in Pipeline" : "No Matching Leads Found"}
            description={
              leads.length === 0
                ? "Your lead pipeline is ready. Parse incoming WhatsApp messages or record new phone inquiries to start tracking bookings."
                : "No leads matched your search or stage filter criteria. Try clearing search filters."
            }
            action={
              leads.length === 0 && (
                <Button variant="primary" size="md" onClick={() => setIsNewInquiryOpen(true)}>
                  + Record First Inquiry
                </Button>
              )
            }
          />
        ) : (
          <div className="rv-list-group">
            {filteredLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onSelect={setSelectedLead}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStage={handleStageChange}
        onUpdateFollowUp={handleScheduleFollowUp}
        onUpdateQuote={handleUpdateQuote}
        onAddNote={handleAddNote}
      />

      {/* New Inquiry Parser Modal */}
      <NewInquiryModal
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
        onAddLead={handleAddLead}
      />
    </div>
  );
};
