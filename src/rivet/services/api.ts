import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  CustomerRecord,
  Lead,
  Job,
  PaymentRecord,
  TaskRecord,
  ActivityItem,
  LeadNote,
  JobNote,
  PaymentNote,
  JobStatus,
  LeadStage,
  PaymentStatus,
  TaskStatus,
} from '../types/rivet';

// Default initial data for persistent local cache
const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    customerCode: 'CUST-101',
    name: 'Rajesh Sharma',
    phone: '+91 98220 12345',
    email: 'rajesh.sharma@example.com',
    city: 'Airport Area',
    healthStatus: 'Payment Due',
    latestServiceRef: 'JOB-901',
    lastActivityDate: '2026-07-29',
    totalSpent: 14200,
    outstandingBalance: 1200,
    nextFollowUp: 'Today, 4:00 PM',
    history: [
      { id: 'h1', date: '2026-07-29', type: 'job', title: 'Airport Express Pickup — Ertiga', details: 'Assigned Ramesh K. • Status: In Progress', badgeLabel: 'JOB-901' },
      { id: 'h2', date: '2026-07-29', type: 'payment', title: 'Advance Paid: ₹1,200 (Balance Due: ₹1,200)', details: 'Mode: UPI • Invoice PAY-401', badgeLabel: 'PARTIAL' },
      { id: 'h3', date: '2026-07-28', type: 'lead', title: 'Inquiry Created via WhatsApp', details: 'Requested 6-seater sedan transfer', badgeLabel: 'NEW' },
    ],
    primaryActionLabel: 'Log Internal Note',
  },
  {
    id: 'c0000002-0000-0000-0000-000000000002',
    customerCode: 'CUST-102',
    name: 'Priya Patel',
    phone: '+91 98221 67890',
    email: 'priya.patel@example.com',
    city: 'Civil Lines',
    healthStatus: 'Active Lead',
    latestServiceRef: 'LD-502',
    lastActivityDate: '2026-07-29',
    totalSpent: 8500,
    outstandingBalance: 0,
    nextFollowUp: 'Tomorrow, 11:30 AM',
    history: [
      { id: 'h4', date: '2026-07-29', type: 'lead', title: 'Quote Sent: ₹8,500', details: 'Corporate sedan fleet rental', badgeLabel: 'QUOTE SENT' },
    ],
    primaryActionLabel: 'Schedule Follow-up',
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'l0000001-0000-0000-0000-000000000001',
    customerName: 'Priya Patel',
    customerPhone: '+91 98221 67890',
    customerEmail: 'priya.patel@example.com',
    serviceTitle: 'Corporate Sedan Fleet Transfer',
    source: 'Website',
    stage: 'Quote Sent',
    budget: '₹8,500',
    quoteAmount: '₹8,500',
    quoteStatus: 'Sent via WhatsApp',
    nextFollowUp: 'Tomorrow, 11:30 AM',
    assignee: 'Suresh M.',
    notes: [{ id: 'n1', author: 'Suresh M.', timestamp: 'Today, 10:15 AM', text: 'Client requested GST tax invoice breakdown.' }],
    createdAt: 'Today, 09:30 AM',
    primaryActionLabel: 'Follow-up Callback',
  },
  {
    id: 'l0000002-0000-0000-0000-000000000002',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98220 12345',
    customerEmail: 'rajesh.sharma@example.com',
    serviceTitle: 'Airport Express Pickup (Ertiga)',
    source: 'WhatsApp',
    stage: 'Confirmed',
    budget: '₹2,400',
    quoteAmount: '₹2,400',
    quoteStatus: 'Approved',
    nextFollowUp: 'Today, 4:00 PM',
    assignee: 'Janai Desk',
    notes: [{ id: 'n2', author: 'Janai Desk', timestamp: 'Today, 11:00 AM', text: 'Driver Ramesh K. dispatched.' }],
    createdAt: '2026-07-28',
    primaryActionLabel: 'Dispatch Vehicle',
  },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'j0000001-0000-0000-0000-000000000001',
    jobCode: 'JOB-901',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98220 12345',
    serviceTitle: 'Airport Express Pickup — Ertiga',
    scheduledDateTime: 'Today, 4:30 PM',
    status: 'In Progress',
    driverName: 'Ramesh K.',
    vehicleDetails: 'Swift Dzire MH-31 EA 4091',
    pickupLocation: 'Airport Terminal',
    dropLocation: 'City Center Hotel',
    payment: { totalAmount: '₹2,400', advancePaid: '₹1,200', dueAmount: '₹1,200', paymentMethod: 'UPI / Cash', status: 'Partial' },
    notes: [{ id: 'jn1', author: 'Ramesh K.', timestamp: 'Today, 4:10 PM', text: 'Arrived at pickup terminal gate 2.' }],
    primaryActionLabel: 'Mark Completed',
  },
];

const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 't0000001-0000-0000-0000-000000000001',
    title: 'Confirm balance payment of ₹1,200 with Rajesh Sharma',
    type: 'Payment Reminder',
    status: 'Overdue',
    priority: 'Critical',
    dueDateTime: 'Today, 4:00 PM',
    assignee: 'Janai Desk',
    linkedEntityId: 'p0000001-0000-0000-0000-000000000001',
    linkedEntityType: 'Payment',
    linkedEntityName: 'Rajesh Sharma',
    notes: 'Client promised UPI settlement after airport arrival.',
  },
  {
    id: 't0000002-0000-0000-0000-000000000002',
    title: 'Follow up on corporate sedan quote approval',
    type: 'Quote Follow-up',
    status: 'Due Soon',
    priority: 'High',
    dueDateTime: 'Tomorrow, 11:30 AM',
    assignee: 'Suresh M.',
    linkedEntityId: 'l0000001-0000-0000-0000-000000000001',
    linkedEntityType: 'Lead',
    linkedEntityName: 'Priya Patel',
    notes: 'Priya requested custom GST invoice breakdown.',
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'p0000001-0000-0000-0000-000000000001',
    paymentCode: 'PAY-401',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98220 12345',
    jobCode: 'JOB-901',
    serviceTitle: 'Airport Express Pickup — Ertiga',
    totalAmount: 2400,
    amountPaid: 1200,
    balanceDue: 1200,
    dueDate: 'Today, 6:00 PM',
    paymentMethod: 'UPI',
    status: 'Partial',
    notes: [{ id: 'pn1', author: 'Janai Desk', timestamp: 'Today, 4:00 PM', text: 'Sent WhatsApp payment link.' }],
    primaryActionLabel: 'Send Payment Link',
  },
];

// Helper to get or set local persistent cache
const getLocalCache = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(`rv_crm_${key}`);
  if (!item) {
    localStorage.setItem(`rv_crm_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(item);
};

const setLocalCache = <T>(key: string, value: T) => {
  localStorage.setItem(`rv_crm_${key}`, JSON.stringify(value));
};

/* ============================================================================
   RIVET CRM API SERVICE (Persistent Supabase / Multi-Tenant Data Layer)
   ============================================================================ */

export const ApiService = {
  // 1. CUSTOMERS API
  async getCustomers(): Promise<CustomerRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('customers').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          customerCode: c.customer_code,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          city: c.city || 'Central HQ',
          healthStatus: c.health_status,
          latestServiceRef: c.latest_service_ref || 'N/A',
          lastActivityDate: c.last_activity_date ? new Date(c.last_activity_date).toISOString().split('T')[0] : 'Today',
          totalSpent: Number(c.total_spent) || 0,
          outstandingBalance: Number(c.outstanding_balance) || 0,
          nextFollowUp: c.next_follow_up || 'Not scheduled',
          history: [],
          primaryActionLabel: c.primary_action_label || 'Open Customer Hub',
        }));
      }
    }
    return getLocalCache('customers', INITIAL_CUSTOMERS);
  },

  async updateCustomer(id: string, updates: Partial<CustomerRecord>): Promise<CustomerRecord[]> {
    if (isSupabaseConfigured) {
      await supabase.from('customers').update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        city: updates.city,
        health_status: updates.healthStatus,
        next_follow_up: updates.nextFollowUp,
      }).eq('id', id);
    }
    const current = getLocalCache('customers', INITIAL_CUSTOMERS);
    const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setLocalCache('customers', updated);
    return updated;
  },

  // 2. LEADS API
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('leads').select('*');
      if (!error && data && data.length > 0) {
        return data.map((l) => ({
          id: l.id,
          customerName: l.customer_name,
          customerPhone: l.customer_phone,
          customerEmail: l.customer_email || '',
          serviceTitle: l.service_title,
          source: l.source,
          stage: l.stage as LeadStage,
          budget: l.budget || '₹0',
          quoteAmount: l.quote_amount || '₹0',
          quoteStatus: l.quote_status || 'Draft',
          nextFollowUp: l.next_follow_up || 'Not set',
          assignee: l.assignee || 'Ops Desk',
          notes: [],
          createdAt: l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Today',
          primaryActionLabel: l.primary_action_label || 'Follow-up Callback',
        }));
      }
    }
    return getLocalCache('leads', INITIAL_LEADS);
  },

  async updateLeadStage(id: string, stage: LeadStage): Promise<Lead[]> {
    if (isSupabaseConfigured) {
      await supabase.from('leads').update({ stage }).eq('id', id);
    }
    const current = getLocalCache('leads', INITIAL_LEADS);
    const updated = current.map((l) => (l.id === id ? { ...l, stage } : l));
    setLocalCache('leads', updated);
    return updated;
  },

  // 3. JOBS API
  async getJobs(): Promise<Job[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('jobs').select('*');
      if (!error && data && data.length > 0) {
        return data.map((j) => ({
          id: j.id,
          jobCode: j.job_code,
          customerName: j.customer_name,
          customerPhone: j.customer_phone,
          serviceTitle: j.service_title,
          scheduledDateTime: j.scheduled_date_time,
          status: j.status as JobStatus,
          driverName: j.driver_name || 'Unassigned',
          vehicleDetails: j.vehicle_details || 'TBD',
          pickupLocation: j.pickup_location,
          dropLocation: j.drop_location,
          payment: {
            totalAmount: `₹${j.total_amount}`,
            advancePaid: `₹${j.advance_paid}`,
            dueAmount: `₹${j.due_amount}`,
            paymentMethod: j.payment_method || 'UPI',
            status: j.payment_status || 'Pending',
          },
          notes: [],
          primaryActionLabel: j.primary_action_label || 'Dispatch Vehicle',
        }));
      }
    }
    return getLocalCache('jobs', INITIAL_JOBS);
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job[]> {
    if (isSupabaseConfigured) {
      await supabase.from('jobs').update({ status }).eq('id', id);
    }
    const current = getLocalCache('jobs', INITIAL_JOBS);
    const updated = current.map((j) => (j.id === id ? { ...j, status } : j));
    setLocalCache('jobs', updated);
    return updated;
  },

  // 4. TASKS API
  async getTasks(): Promise<TaskRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          title: t.title,
          type: t.type,
          status: t.status as TaskStatus,
          priority: t.priority,
          dueDateTime: t.due_date_time,
          assignee: t.assignee || 'Ops Desk',
          linkedEntityId: t.linked_entity_id,
          linkedEntityType: t.linked_entity_type,
          linkedEntityName: t.linked_entity_name,
          notes: t.notes || '',
        }));
      }
    }
    return getLocalCache('tasks', INITIAL_TASKS);
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<TaskRecord[]> {
    if (isSupabaseConfigured) {
      await supabase.from('tasks').update({ status }).eq('id', id);
    }
    const current = getLocalCache('tasks', INITIAL_TASKS);
    const updated = current.map((t) => (t.id === id ? { ...t, status } : t));
    setLocalCache('tasks', updated);
    return updated;
  },

  // 5. PAYMENTS API
  async getPayments(): Promise<PaymentRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('payments').select('*');
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          paymentCode: p.payment_code,
          customerName: p.customer_name,
          customerPhone: p.customer_phone,
          jobCode: p.job_code,
          serviceTitle: p.service_title,
          totalAmount: Number(p.total_amount),
          amountPaid: Number(p.amount_paid),
          balanceDue: Number(p.balance_due),
          dueDate: p.due_date,
          paymentMethod: p.payment_method || 'UPI',
          status: p.status as PaymentStatus,
          notes: [],
          primaryActionLabel: p.primary_action_label || 'Send Payment Link',
        }));
      }
    }
    return getLocalCache('payments', INITIAL_PAYMENTS);
  },

  async recordPaymentCollection(id: string, amount: number): Promise<PaymentRecord[]> {
    const current = getLocalCache('payments', INITIAL_PAYMENTS);
    const updated = current.map((p) => {
      if (p.id !== id) return p;
      const newPaid = p.amountPaid + amount;
      const newDue = Math.max(0, p.totalAmount - newPaid);
      const newStatus: PaymentStatus = newDue === 0 ? 'Paid' : 'Partial';
      
      if (isSupabaseConfigured) {
        supabase.from('payments').update({
          amount_paid: newPaid,
          balance_due: newDue,
          status: newStatus,
        }).eq('id', id);
      }

      return {
        ...p,
        amountPaid: newPaid,
        balanceDue: newDue,
        status: newStatus,
      };
    });
    setLocalCache('payments', updated);
    return updated;
  },
};
