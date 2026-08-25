import React, { useState, useMemo, useEffect } from 'react';
import { CustomerRecord, CustomerHealthStatus, Lead, Job, PaymentRecord, TaskRecord } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
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
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'All' | CustomerHealthStatus>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  useEffect(() => {
    const wsId = user?.workspaceId;
    setLoading(true);
    Promise.all([
      ApiService.getCustomers(wsId),
      ApiService.getLeads(wsId),
      ApiService.getJobs(wsId),
      ApiService.getPayments(wsId),
      ApiService.getTasks(wsId),
    ])
      .then(([c, l, j, p, t]) => {
        setCustomers(c);
        setLeads(l);
        setJobs(j);
        setPayments(p);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, [user?.workspaceId]);

  // Filter customers by search query and health status filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesHealth = healthFilter === 'All' || cust.healthStatus === healthFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.phone.toLowerCase().includes(q) ||
        (cust.email && cust.email.toLowerCase().includes(q)) ||
        cust.customerCode.toLowerCase().includes(q) ||
        cust.city.toLowerCase().includes(q) ||
        cust.latestServiceRef.toLowerCase().includes(q);
      return matchesHealth && matchesSearch;
    });
  }, [customers, healthFilter, searchQuery]);

  // Add Note handler — routes note persistence to Supabase
  const handleAddNote = (customerId: string, noteText: string) => {
    ApiService.addCustomerNote(customerId, noteText, actor)
      .then(() => {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id !== customerId) return c;
            const newHistoryItem = {
              id: `h-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'note' as const,
              title: 'Internal Note Added',
              details: noteText,
              badgeLabel: 'NOTE',
            };
            const updated = {
              ...c,
              history: [newHistoryItem, ...c.history],
              lastActivityDate: 'Just now',
            };
            if (selectedCustomer?.id === customerId) {
              setSelectedCustomer(updated);
            }
            return updated;
          })
        );
      })
      .catch(console.error);
  };

  // Follow-up updater handler
  const handleUpdateFollowUp = (customerId: string, nextTime: string) => {
    ApiService.updateCustomerFollowUp(customerId, nextTime, actor)
      .then((updated) => {
        setCustomers(updated);
        const refreshed = updated.find((c) => c.id === customerId) || null;
        if (selectedCustomer?.id === customerId) setSelectedCustomer(refreshed);
      })
      .catch(console.error);
  };

  // Status counts for tab badges
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

  if (selectedCustomer) {
    return (
      <CustomerAccountView
        customer={selectedCustomer}
        allLeads={leads}
        allJobs={jobs}
        allPayments={payments}
        allTasks={tasks}
        onBack={() => setSelectedCustomer(null)}
        onAddNote={handleAddNote}
        onUpdateFollowUp={handleUpdateFollowUp}
        onUpdateLeadStage={() => {}}
        onUpdateJobStatus={() => {}}
        onUpdatePaymentRecord={() => {}}
      />
    );
  }

  return (
    <div>
      <PageHeader
        kicker="Client Relationships"
        title="Customer Accounts"
        subline="Unified directory of service clients, booking history, lifetime revenue, and balance status"
      />

      <div className="rv-table-container">
        <div className="rv-table-header">
          {/* Health Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter customers by health status">
            {HEALTH_FILTERS.map((st) => {
              const count = getHealthCount(st);
              const isActive = healthFilter === st;
              return (
                <button
                  key={st}
                  className={`rv-queue-tab ${isActive ? 'rv-queue-tab--active' : ''}`}
                  onClick={() => setHealthFilter(st)}
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
              placeholder="Search customer, phone, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Rows */}
        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon="👥"
            title={customers.length === 0 ? "No Customer Accounts" : "No Matching Customers Found"}
            description={
              customers.length === 0
                ? "Customer accounts are created automatically when leads are confirmed into dispatch jobs."
                : "No customer records match your search or health filter criteria."
            }
          />
        ) : (
          <div className="rv-list-group">
            {filteredCustomers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onSelect={setSelectedCustomer}
                onQuickAction={setSelectedCustomer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
