import React, { useState, useMemo } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_LEADS, INITIAL_JOBS, INITIAL_PAYMENTS, INITIAL_TASKS } from '../../data/mockData';
import { CustomerRecord, CustomerHealthStatus, SimulationMode, Lead, Job, PaymentRecord, TaskRecord, LeadStage, JobStatus, PaymentStatus } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { CustomerRow } from './CustomerRow';
import { CustomerAccountView } from './CustomerAccountView';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'All' | CustomerHealthStatus>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');

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

  // Add note handler
  const handleAddNote = (customerId: string, noteText: string) => {
    const newHistoryItem = {
      id: `ch-${Date.now()}`,
      date: 'Just now',
      type: 'note' as const,
      title: 'Internal Ops Note Added',
      details: noteText,
      badgeLabel: 'Note',
    };
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, history: [newHistoryItem, ...c.history] }
          : c
      )
    );
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) =>
        prev
          ? { ...prev, history: [newHistoryItem, ...prev.history] }
          : null
      );
    }
  };

  // Edit note handler
  const handleEditNote = (noteId: string, newText: string) => {
    if (!selectedCustomer) return;
    const customerId = selectedCustomer.id;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              history: c.history.map((h) => (h.id === noteId ? { ...h, details: newText } : h)),
            }
          : c
      )
    );
    setSelectedCustomer((prev) =>
      prev
        ? {
            ...prev,
            history: prev.history.map((h) => (h.id === noteId ? { ...h, details: newText } : h)),
          }
        : null
    );
  };

  // Follow-up date update handler
  const handleUpdateFollowUp = (customerId: string, nextTime: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, nextFollowUp: nextTime } : c))
    );
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) => (prev ? { ...prev, nextFollowUp: nextTime } : null));
    }
  };

  // Lead stage update handler
  const handleUpdateLeadStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
  };

  // Job status update handler
  const handleUpdateJobStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  // Payment record update handler
  const handleUpdatePaymentRecord = (paymentId: string, amountPaid: number, method: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const newPaid = p.amountPaid + amountPaid;
        const newBalance = Math.max(0, p.totalAmount - newPaid);
        let newStatus: PaymentStatus = p.status;
        if (newBalance === 0) newStatus = 'Paid';
        else if (newPaid > 0) newStatus = 'Partial';

        return {
          ...p,
          amountPaid: newPaid,
          balanceDue: newBalance,
          paymentMethod: method,
          status: newStatus,
        };
      })
    );
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
