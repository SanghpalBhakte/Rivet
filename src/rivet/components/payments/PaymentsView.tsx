import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_PAYMENTS } from '../../data/mockData';
import { PaymentRecord, PaymentStatus, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { PaymentRow } from './PaymentRow';
import { PaymentDetailDrawer } from './PaymentDetailDrawer';
import { ApiService } from '../../services/api';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');

  useEffect(() => {
    ApiService.getPayments().then(setPayments);
  }, []);

  // Filter payments by search query and status filter
  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pay.customerName.toLowerCase().includes(q) ||
        pay.customerPhone.toLowerCase().includes(q) ||
        pay.serviceTitle.toLowerCase().includes(q) ||
        pay.paymentCode.toLowerCase().includes(q) ||
        pay.jobCode.toLowerCase().includes(q) ||
        pay.paymentMethod.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchQuery]);

  // Record received payment handler — persists to Supabase
  const handleRecordPayment = (
    paymentId: string,
    receivedAmount: number,
    method: string,
    noteText?: string
  ) => {
    ApiService.recordPaymentCollection(paymentId, receivedAmount, method, noteText)
      .then((updated) => {
        setPayments(updated);
        if (selectedPayment?.id === paymentId) {
          const refreshed = updated.find((p) => p.id === paymentId) || null;
          setSelectedPayment(refreshed);
        }
      })
      .catch(console.error);
  };


  // Mark fully paid handler
  const handleMarkFullyPaid = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const newNote = {
          id: `pn-${Date.now()}`,
          author: 'Janai Desk',
          timestamp: 'Just now',
          text: `Marked fully paid (₹${p.totalAmount.toLocaleString('en-IN')}). Account settled.`,
        };
        return {
          ...p,
          amountPaid: p.totalAmount,
          balanceDue: 0,
          status: 'Paid',
          notes: [newNote, ...p.notes],
        };
      })
    );

    if (selectedPayment && selectedPayment.id === paymentId) {
      setSelectedPayment((prev) => {
        if (!prev) return null;
        const newNote = {
          id: `pn-${Date.now()}`,
          author: 'Janai Desk',
          timestamp: 'Just now',
          text: `Marked fully paid (₹${prev.totalAmount.toLocaleString('en-IN')}). Account settled.`,
        };
        return {
          ...prev,
          amountPaid: prev.totalAmount,
          balanceDue: 0,
          status: 'Paid',
          notes: [newNote, ...prev.notes],
        };
      });
    }
  };

  // Add note handler
  const handleAddNote = (paymentId: string, noteText: string) => {
    const newNote = {
      id: `pn-${Date.now()}`,
      author: 'Janai Desk',
      timestamp: 'Just now',
      text: noteText,
    };
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, notes: [newNote, ...p.notes] } : p))
    );
    if (selectedPayment && selectedPayment.id === paymentId) {
      setSelectedPayment((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
      );
    }
  };

  // Status counts for tab badges
  const getStatusCount = (st: 'All' | PaymentStatus) => {
    if (st === 'All') return payments.length;
    return payments.filter((p) => p.status === st).length;
  };

  const STATUS_FILTERS: ('All' | PaymentStatus)[] = [
    'All',
    'Paid',
    'Partial',
    'Due Soon',
    'Overdue',
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Payments & Accounts Due"
        subline="Janai Tours & Service Ops • Operational payment tracking, balance collections, & payment records"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Main Payments Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search & Filter Bar */}
        <div className="rv-leads-bar">
          {/* Search Input */}
          <div className="rv-search-wrapper">
            <span className="rv-search-icon">🔍</span>
            <input
              type="text"
              className="rv-search-input"
              placeholder="Search payment #, work order #, customer, or method..."
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

          {/* Status Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter payments by status">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                className={`rv-queue-tab ${statusFilter === st ? 'rv-queue-tab--active' : ''}`}
                onClick={() => setStatusFilter(st)}
                role="tab"
                aria-selected={statusFilter === st}
              >
                <span>{st}</span>
                <span className="rv-queue-tab__count rv-num">{getStatusCount(st)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payments List / Table */}
        {simMode === 'loading' ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : simMode === 'empty' || filteredPayments.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No payment records match your filter"
            description="Try clearing your search query or selecting a different status tab."
          />
        ) : (
          <ul className="rv-queue-list" role="list">
            {filteredPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onSelect={(selected) => setSelectedPayment(selected)}
                onQuickAction={(selected) => setSelectedPayment(selected)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Payment Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRecordPayment={handleRecordPayment}
        onMarkFullyPaid={handleMarkFullyPaid}
        onAddNote={handleAddNote}
      />
    </div>
  );
};
