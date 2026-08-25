import React, { useState, useMemo, useEffect } from 'react';
import { PaymentRecord, PaymentStatus } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { PaymentRow } from './PaymentRow';
import { PaymentDetailDrawer } from './PaymentDetailDrawer';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PaymentsView: React.FC = () => {
  const { user, can } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    ApiService.getPayments(user?.workspaceId)
      .then(setPayments)
      .finally(() => setLoading(false));
  }, [user?.workspaceId]);

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
    if (!can('payment:record')) {
      alert(`Role "${user?.role}" does not have permission to record payments.`);
      return;
    }
    ApiService.recordPaymentCollection(paymentId, receivedAmount, method, noteText, actor)
      .then((updated) => {
        setPayments(updated);
        if (selectedPayment?.id === paymentId) {
          const refreshed = updated.find((p) => p.id === paymentId) || null;
          setSelectedPayment(refreshed);
        }
      })
      .catch(console.error);
  };

  // Add note handler
  const handleAddNote = (paymentId: string, text: string) => {
    ApiService.addNote(paymentId, 'Payment', text, actor.id, actor.name, actor.workspaceId)
      .then((newNote) => {
        setPayments((prev) =>
          prev.map((p) => {
            if (p.id !== paymentId) return p;
            const updatedNotes = [newNote, ...p.notes];
            return { ...p, notes: updatedNotes as any };
          })
        );
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment((prev) => (prev ? { ...prev, notes: [newNote as any, ...prev.notes] } : null));
        }
      })
      .catch(console.error);
  };

  // Status counts for tab badges
  const getStatusCount = (st: 'All' | PaymentStatus) => {
    if (st === 'All') return payments.length;
    return payments.filter((p) => p.status === st).length;
  };

  const STATUS_FILTERS: ('All' | PaymentStatus)[] = [
    'All',
    'Due Soon',
    'Overdue',
    'Partial',
    'Paid',
  ];

  return (
    <div>
      <PageHeader
        kicker="Financial Accounting"
        title="Payments Ledger"
        subline="Client service billing, advance collections, balance tracking, and overdue recovery"
      />

      <div className="rv-table-container">
        <div className="rv-table-header">
          {/* Status Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter payments by status">
            {STATUS_FILTERS.map((st) => {
              const count = getStatusCount(st);
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  className={`rv-queue-tab ${isActive ? 'rv-queue-tab--active' : ''}`}
                  onClick={() => setStatusFilter(st)}
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
              placeholder="Search payment code, customer, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Payment Rows */}
        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon="💳"
            title={payments.length === 0 ? "No Payment Records in Ledger" : "No Matching Payments Found"}
            description={
              payments.length === 0
                ? "Payments ledger is clean. Invoices and collection tasks are automatically generated when jobs are dispatched."
                : "No payment records match your search or status filter. Try clearing filters."
            }
          />
        ) : (
          <div className="rv-list-group">
            {filteredPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onSelect={setSelectedPayment}
                onQuickAction={(p) => setSelectedPayment(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRecordPayment={handleRecordPayment}
        onAddNote={handleAddNote}
      />
    </div>
  );
};
