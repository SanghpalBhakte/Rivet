import React, { useState, useMemo } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_LEADS, INITIAL_JOBS, INITIAL_PAYMENTS } from '../../data/mockData';
import { CustomerRecord, CustomerHealthStatus, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { CustomerRow } from './CustomerRow';
import { CustomerAccountView } from './CustomerAccountView';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
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

  // If a customer is selected, display Customer / Account View V1 workspace
  if (selectedCustomer) {
    return (
      <div>
        <CustomerAccountView
          customer={selectedCustomer}
          allLeads={INITIAL_LEADS}
          allJobs={INITIAL_JOBS}
          allPayments={INITIAL_PAYMENTS}
          onBack={() => setSelectedCustomer(null)}
          onAddNote={handleAddNote}
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
