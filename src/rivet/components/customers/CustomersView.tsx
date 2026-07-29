import React, { useState, useMemo, useEffect } from 'react';
import { CustomerRecord, CustomerHealthStatus, SimulationMode, Lead, Job, PaymentRecord, TaskRecord, LeadStage, JobStatus } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { CustomerRow } from './CustomerRow';
import { CustomerAccountView } from './CustomerAccountView';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CustomersView: React.FC = () => {
  const { user } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'All' | CustomerHealthStatus>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');

  useEffect(() => {
    ApiService.getCustomers().then(setCustomers);
    ApiService.getLeads().then(setLeads);
    ApiService.getJobs().then(setJobs);
    ApiService.getPayments().then(setPayments);
    ApiService.getTasks().then(setTasks);
  }, []);

  // Filter customers by search query and health status filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesHealth = healthFilter === 'All' || cust.healthStatus === healthFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.phone.toLowerCase().includes(q) ||
        cust.email.toLowerCase().includes(q) ||
        cust.city.toLowerCase().includes(q) ||
        cust.customerCode.toLowerCase().includes(q) ||
        cust.latestServiceRef.toLowerCase().includes(q);
      return matchesHealth && matchesSearch;
    });
  }, [customers, healthFilter, searchQuery]);

  // Add customer note — persists to Supabase + logs activity
  const handleAddNote = (customerId: string, noteText: string) => {
    ApiService.addCustomerNote(customerId, noteText, actor)
      .then((newNote) => {
        const historyItem = {
          id: newNote.id,
          date: newNote.timestamp,
          type: 'note' as const,
          title: 'Internal Ops Note Added',
          details: newNote.text,
          badgeLabel: 'Note',
        };
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId ? { ...c, history: [historyItem, ...c.history] } : c
          )
        );
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer((prev) =>
            prev ? { ...prev, history: [historyItem, ...prev.history] } : null
          );
        }
      })
      .catch(console.error);
  };

  // Edit note — persists to Supabase then updates local state
  const handleEditNote = (noteId: string, newText: string) => {
    if (!selectedCustomer) return;
    const customerId = selectedCustomer.id;
    ApiService.updateNote(noteId, newText, actor)
      .then(() => {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, history: c.history.map((h) => (h.id === noteId ? { ...h, details: newText } : h)) }
              : c
          )
        );
        setSelectedCustomer((prev) =>
          prev ? { ...prev, history: prev.history.map((h) => (h.id === noteId ? { ...h, details: newText } : h)) } : null
        );
      })
      .catch(console.error);
  };

  // Follow-up update — persists to Supabase
  const handleUpdateFollowUp = (customerId: string, nextTime: string) => {
    ApiService.updateCustomerFollowUp(customerId, nextTime, actor)
      .then((updated) => {
        setCustomers(updated);
        const found = updated.find((c) => c.id === customerId) || null;
        if (selectedCustomer?.id === customerId) setSelectedCustomer(found);
      })
      .catch(console.error);
  };

  // Lead stage update — persists to Supabase
  const handleUpdateLeadStage = (leadId: string, newStage: LeadStage) => {
    ApiService.updateLeadStage(leadId, newStage, actor)
      .then(setLeads)
      .catch(console.error);
  };

  // Job status update — persists to Supabase
  const handleUpdateJobStatus = (jobId: string, newStatus: JobStatus) => {
    ApiService.updateJobStatus(jobId, newStatus, actor)
      .then(setJobs)
      .catch(console.error);
  };

  // Payment record update — persists to Supabase
  const handleUpdatePaymentRecord = (paymentId: string, amountPaid: number, method: string) => {
    ApiService.recordPaymentCollection(paymentId, amountPaid, method, undefined, actor)
      .then(setPayments)
      .catch(console.error);
  };

  // Health counts for tab badges
  const getHealthCount = (st: 'All' | CustomerHealthStatus) => {
    if (st === 'All') return customers.length;
    return customers.filter((c) => c.healthStatus === st).length;
  };

  const HEALTH_FILTERS: ('All' | CustomerHealthStatus)[] = [
    'All',
    'Active Lead',
    'Job In Progress',
    'Payment Due',
    'Repeat Client',
  ];

  // If a customer is selected, display Customer / Account View V2 workspace
  if (selectedCustomer) {
    return (
      <div>
        <CustomerAccountView
          customer={selectedCustomer}
          allLeads={leads}
          allJobs={jobs}
          allPayments={payments}
          allTasks={tasks}
          onBack={() => setSelectedCustomer(null)}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onUpdateFollowUp={handleUpdateFollowUp}
          onUpdateLeadStage={handleUpdateLeadStage}
          onUpdateJobStatus={handleUpdateJobStatus}
          onUpdatePaymentRecord={handleUpdatePaymentRecord}
        />
      </div>
    );
  }


  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Customers & Account History"
        subline="Janai Tours & Service Ops • Operational timeline history across leads, jobs, and payments"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Main Customers Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search & Filter Bar */}
        <div className="rv-leads-bar">
          {/* Search Input */}
          <div className="rv-search-wrapper">
            <span className="rv-search-icon">🔍</span>
            <input
              type="text"
              className="rv-search-input"
              placeholder="Search customer name, phone, email, city, or service reference..."
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

          {/* Health Status Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter customers by health status">
            {HEALTH_FILTERS.map((st) => (
              <button
                key={st}
                className={`rv-queue-tab ${healthFilter === st ? 'rv-queue-tab--active' : ''}`}
                onClick={() => setHealthFilter(st)}
                role="tab"
                aria-selected={healthFilter === st}
              >
                <span>{st}</span>
                <span className="rv-queue-tab__count rv-num">{getHealthCount(st)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Customers List / Table */}
        {simMode === 'loading' ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : simMode === 'empty' || filteredCustomers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No customer accounts match your filter"
            description="Try clearing your search query or selecting a different status tab."
          />
        ) : (
          <ul className="rv-queue-list" role="list">
            {filteredCustomers.map((cust) => (
              <CustomerRow
                key={cust.id}
                customer={cust}
                onSelect={(selected) => setSelectedCustomer(selected)}
                onQuickAction={(selected) => setSelectedCustomer(selected)}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
