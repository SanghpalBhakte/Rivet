import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  CustomerRecord,
  Lead,
  Job,
  PaymentRecord,
  TaskRecord,
  LeadNote,
  JobNote,
  PaymentNote,
  JobStatus,
  LeadStage,
  PaymentStatus,
  TaskStatus,
  TaskType,
  TaskPriority,
} from '../types/rivet';

/* ============================================================================
   SEED WORKSPACE — matches seed.sql
   ============================================================================ */
export const DEV_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

/* ============================================================================
   LOCAL FALLBACK DATA — used only when Supabase returns 0 rows.
   localStorage is NOT used as a write target.
   ============================================================================ */
const FALLBACK_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
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
    ],
    primaryActionLabel: 'Log Internal Note',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
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
    history: [],
    primaryActionLabel: 'Schedule Follow-up',
  },
];

const FALLBACK_LEADS: Lead[] = [
  {
    id: '1ead0000-0000-0000-0000-000000000001',
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
    id: '1ead0000-0000-0000-0000-000000000002',
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

const FALLBACK_JOBS: Job[] = [
  {
    id: 'db000000-0000-0000-0000-000000000001',
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

const FALLBACK_TASKS: TaskRecord[] = [
  {
    id: 'da000000-0000-0000-0000-000000000001',
    title: 'Confirm balance payment of ₹1,200 with Rajesh Sharma',
    type: 'Payment Reminder',
    status: 'Overdue',
    priority: 'Critical',
    dueDateTime: 'Today, 4:00 PM',
    assignee: 'Janai Desk',
    linkedEntityId: 'fa000000-0000-0000-0000-000000000001',
    linkedEntityType: 'Payment',
    linkedEntityName: 'Rajesh Sharma',
    notes: 'Client promised UPI settlement after airport arrival.',
  },
  {
    id: 'da000000-0000-0000-0000-000000000002',
    title: 'Follow up on corporate sedan quote approval',
    type: 'Quote Follow-up',
    status: 'Due Soon',
    priority: 'High',
    dueDateTime: 'Tomorrow, 11:30 AM',
    assignee: 'Suresh M.',
    linkedEntityId: '1ead0000-0000-0000-0000-000000000001',
    linkedEntityType: 'Lead',
    linkedEntityName: 'Priya Patel',
    notes: 'Priya requested custom GST invoice breakdown.',
  },
];

const FALLBACK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'fa000000-0000-0000-0000-000000000001',
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

/* ============================================================================
   ACTIVITY LOG TYPES
   ============================================================================ */
export interface ActivityLogEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  actorName: string;
  entityId: string;
  entityType: string;
  createdAt: string;
}

/* ============================================================================
   MAPPERS
   ============================================================================ */
const mapCustomer = (c: Record<string, unknown>): CustomerRecord => ({
  id: c.id as string,
  customerCode: c.customer_code as string,
  name: c.name as string,
  phone: c.phone as string,
  email: (c.email as string) || '',
  city: (c.city as string) || 'Central HQ',
  healthStatus: c.health_status as CustomerRecord['healthStatus'],
  latestServiceRef: (c.latest_service_ref as string) || 'N/A',
  lastActivityDate: c.last_activity_date
    ? new Date(c.last_activity_date as string).toISOString().split('T')[0]
    : 'Today',
  totalSpent: Number(c.total_spent) || 0,
  outstandingBalance: Number(c.outstanding_balance) || 0,
  nextFollowUp: (c.next_follow_up as string) || 'Not scheduled',
  history: [],
  primaryActionLabel: (c.primary_action_label as string) || 'Open Customer Hub',
});

const mapLead = (l: Record<string, unknown>): Lead => ({
  id: l.id as string,
  customerName: l.customer_name as string,
  customerPhone: l.customer_phone as string,
  customerEmail: (l.customer_email as string) || '',
  serviceTitle: l.service_title as string,
  source: l.source as Lead['source'],
  stage: l.stage as LeadStage,
  budget: (l.budget as string) || '₹0',
  quoteAmount: (l.quote_amount as string) || '₹0',
  quoteStatus: (l.quote_status as string) || 'Draft',
  nextFollowUp: (l.next_follow_up as string) || 'Not set',
  assignee: (l.assignee as string) || 'Ops Desk',
  notes: [],
  createdAt: l.created_at
    ? new Date(l.created_at as string).toLocaleDateString()
    : 'Today',
  primaryActionLabel: (l.primary_action_label as string) || 'Follow-up Callback',
});

const mapJob = (j: Record<string, unknown>): Job => ({
  id: j.id as string,
  jobCode: j.job_code as string,
  customerName: j.customer_name as string,
  customerPhone: j.customer_phone as string,
  serviceTitle: j.service_title as string,
  scheduledDateTime: j.scheduled_date_time as string,
  status: j.status as JobStatus,
  driverName: (j.driver_name as string) || 'Unassigned',
  vehicleDetails: (j.vehicle_details as string) || 'TBD',
  pickupLocation: j.pickup_location as string,
  dropLocation: j.drop_location as string,
  payment: {
    totalAmount: `₹${j.total_amount}`,
    advancePaid: `₹${j.advance_paid}`,
    dueAmount: `₹${j.due_amount}`,
    paymentMethod: (j.payment_method as string) || 'UPI',
    status: ((j.payment_status as string) || 'Pending') as 'Pending' | 'Partial' | 'Paid',
  },
  notes: [],
  primaryActionLabel: (j.primary_action_label as string) || 'Dispatch Vehicle',
});

const mapTask = (t: Record<string, unknown>): TaskRecord => ({
  id: t.id as string,
  title: t.title as string,
  type: t.type as TaskType,
  status: t.status as TaskStatus,
  priority: t.priority as TaskRecord['priority'],
  dueDateTime: t.due_date_time as string,
  assignee: (t.assignee as string) || 'Ops Desk',
  linkedEntityId: t.linked_entity_id as string | undefined,
  linkedEntityType: t.linked_entity_type as TaskRecord['linkedEntityType'],
  linkedEntityName: t.linked_entity_name as string | undefined,
  notes: (t.notes as string) || '',
});

const mapPayment = (p: Record<string, unknown>): PaymentRecord => ({
  id: p.id as string,
  paymentCode: p.payment_code as string,
  customerName: p.customer_name as string,
  customerPhone: p.customer_phone as string,
  jobCode: p.job_code as string,
  serviceTitle: p.service_title as string,
  totalAmount: Number(p.total_amount),
  amountPaid: Number(p.amount_paid),
  balanceDue: Number(p.balance_due),
  dueDate: p.due_date as string,
  paymentMethod: (p.payment_method as string) || 'UPI',
  status: p.status as PaymentStatus,
  notes: [],
  primaryActionLabel: (p.primary_action_label as string) || 'Send Payment Link',
});

const mapNote = (n: Record<string, unknown>): LeadNote => ({
  id: n.id as string,
  author: (n.author_name as string) || 'Ops Staff',
  timestamp: n.created_at
    ? new Date(n.created_at as string).toLocaleString()
    : 'Just now',
  text: n.text as string,
});

const mapActivity = (a: Record<string, unknown>): ActivityLogEntry => ({
  id: a.id as string,
  category: (a.category as string) || 'general',
  title: a.title as string,
  description: (a.description as string) || '',
  actorName: (a.actor_name as string) || 'Ops Staff',
  entityId: (a.entity_id as string) || '',
  entityType: (a.entity_type as string) || '',
  createdAt: a.created_at
    ? new Date(a.created_at as string).toLocaleString()
    : 'Just now',
});

/* ============================================================================
   INTERNAL HELPERS
   ============================================================================ */

/** Fire-and-forget activity log — never blocks the calling operation */
async function _logActivity(opts: {
  workspaceId: string;
  actorId?: string;
  actorName?: string;
  category: string;
  title: string;
  description: string;
  entityId?: string;
  entityType?: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('activity_logs').insert({
      workspace_id: opts.workspaceId,
      actor_id: opts.actorId || null,
      actor_name: opts.actorName || 'Ops Staff',
      category: opts.category,
      title: opts.title,
      description: opts.description,
      entity_id: opts.entityId || null,
      entity_type: opts.entityType || null,
    });
  } catch {
    // Activity logging is non-critical — never throw
  }
}

async function _loadNotes(entityId: string): Promise<LeadNote[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('linked_entity_id', entityId)
    .order('created_at', { ascending: false });
  return data ? (data as Record<string, unknown>[]).map(mapNote) : [];
}

/* ============================================================================
   RIVET CRM API SERVICE — Phase 3
   All writes are awaited. localStorage is not a write target.
   Activity logs are written after every meaningful CRM action.
   ============================================================================ */
export const ApiService = {

  /* ── WORKSPACE MEMBERSHIP ───────────────────────────────────────────────── */

  /**
   * Called after login. Ensures the authenticated user is recorded as a member
   * of their workspace. Idempotent — safe to call on every session restore.
   */
  async ensureWorkspaceMembership(
    userId: string,
    workspaceId: string,
    role: string = 'operations'
  ): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      await supabase.from('workspace_members').insert({
        workspace_id: workspaceId,
        user_id: userId,
        role,
      });
    }
  },

  /* ── ACTIVITY LOGS ──────────────────────────────────────────────────────── */

  async getActivityLog(
    workspaceId: string = DEV_WORKSPACE_ID,
    entityId?: string,
    limit = 50
  ): Promise<ActivityLogEntry[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data, error } = await query;
    if (error) console.error('[Rivet] getActivityLog:', error.message);
    return data ? (data as Record<string, unknown>[]).map(mapActivity) : [];
  },

  /* ── CUSTOMERS ─────────────────────────────────────────────────────────── */

  async getCustomers(): Promise<CustomerRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('[Rivet] getCustomers:', error.message);
      if (data && data.length > 0) return (data as Record<string, unknown>[]).map(mapCustomer);
    }
    return FALLBACK_CUSTOMERS;
  },

  async updateCustomer(
    id: string,
    updates: Partial<CustomerRecord>,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<CustomerRecord[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('customers').update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        city: updates.city,
        health_status: updates.healthStatus,
        next_follow_up: updates.nextFollowUp,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw new Error(`[Rivet] updateCustomer: ${error.message}`);

      await _logActivity({
        workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'customer',
        title: 'Customer record updated',
        description: `Updated fields: ${Object.keys(updates).join(', ')}`,
        entityId: id,
        entityType: 'Customer',
      });

      return this.getCustomers();
    }
    return FALLBACK_CUSTOMERS.map((c) => (c.id === id ? { ...c, ...updates } : c));
  },

  async getCustomerNotes(customerId: string): Promise<LeadNote[]> {
    return _loadNotes(customerId);
  },

  async addCustomerNote(
    customerId: string,
    text: string,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<LeadNote> {
    const workspaceId = actor?.workspaceId || DEV_WORKSPACE_ID;
    const note = await this.addNote(customerId, 'Customer', text, actor?.id, actor?.name, workspaceId);

    await _logActivity({
      workspaceId,
      actorId: actor?.id,
      actorName: actor?.name,
      category: 'note',
      title: 'Internal note added to customer',
      description: text.substring(0, 120),
      entityId: customerId,
      entityType: 'Customer',
    });

    return note;
  },

  async updateCustomerFollowUp(
    customerId: string,
    nextFollowUp: string,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<CustomerRecord[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('customers').update({
        next_follow_up: nextFollowUp,
        updated_at: new Date().toISOString(),
      }).eq('id', customerId);
      if (error) throw new Error(`[Rivet] updateCustomerFollowUp: ${error.message}`);

      await _logActivity({
        workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'customer',
        title: 'Follow-up scheduled',
        description: `Next follow-up set to: ${nextFollowUp}`,
        entityId: customerId,
        entityType: 'Customer',
      });

      return this.getCustomers();
    }
    return FALLBACK_CUSTOMERS.map((c) =>
      c.id === customerId ? { ...c, nextFollowUp } : c
    );
  },

  /* ── LEADS ─────────────────────────────────────────────────────────────── */

  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('[Rivet] getLeads:', error.message);
      if (data && data.length > 0) {
        const leads = (data as Record<string, unknown>[]).map(mapLead);
        for (const lead of leads) {
          lead.notes = await _loadNotes(lead.id);
        }
        return leads;
      }
    }
    return FALLBACK_LEADS;
  },

  async createLead(
    lead: Omit<Lead, 'id' | 'notes' | 'createdAt'>,
    workspaceId: string = DEV_WORKSPACE_ID,
    actor?: { id?: string; name?: string }
  ): Promise<Lead[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('leads').insert({
        workspace_id: workspaceId,
        customer_name: lead.customerName,
        customer_phone: lead.customerPhone,
        customer_email: lead.customerEmail || null,
        service_title: lead.serviceTitle,
        source: lead.source,
        stage: lead.stage,
        budget: lead.budget || '₹0',
        quote_amount: lead.quoteAmount || '₹0',
        quote_status: lead.quoteStatus || 'Not Sent',
        next_follow_up: lead.nextFollowUp || null,
        assignee: lead.assignee || 'Janai Desk',
        primary_action_label: lead.primaryActionLabel || 'Mark Contacted',
      });
      if (error) throw new Error(`[Rivet] createLead: ${error.message}`);

      await _logActivity({
        workspaceId,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'lead',
        title: 'New lead created',
        description: `${lead.customerName} — ${lead.serviceTitle} via ${lead.source}`,
        entityType: 'Lead',
      });

      return this.getLeads();
    }
    return [{ ...lead, id: `ld-${Date.now()}`, notes: [], createdAt: new Date().toISOString().split('T')[0] }, ...FALLBACK_LEADS];
  },

  async updateLeadStage(
    id: string,
    stage: LeadStage,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<Lead[]> {
    const label =
      stage === 'New' ? 'Mark Contacted'
      : stage === 'Contacted' ? 'Send Quote'
      : stage === 'Quote Sent' ? 'Mark Confirmed'
      : stage === 'Confirmed' ? 'Close & Archive'
      : 'Reopen Lead';

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('leads').update({
        stage,
        primary_action_label: label,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw new Error(`[Rivet] updateLeadStage: ${error.message}`);

      await _logActivity({
        workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'lead',
        title: `Lead stage changed to ${stage}`,
        description: `Stage progression: → ${stage}`,
        entityId: id,
        entityType: 'Lead',
      });

      return this.getLeads();
    }
    return FALLBACK_LEADS.map((l) => (l.id === id ? { ...l, stage } : l));
  },

  async updateLeadDetails(
    id: string,
    updates: { quoteAmount?: string; quoteStatus?: string; nextFollowUp?: string },
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<Lead[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('leads').update({
        ...(updates.quoteAmount && { quote_amount: updates.quoteAmount }),
        ...(updates.quoteStatus && { quote_status: updates.quoteStatus }),
        ...(updates.nextFollowUp && { next_follow_up: updates.nextFollowUp }),
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw new Error(`[Rivet] updateLeadDetails: ${error.message}`);

      if (updates.nextFollowUp) {
        await _logActivity({
          workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
          actorId: actor?.id,
          actorName: actor?.name,
          category: 'lead',
          title: 'Lead follow-up rescheduled',
          description: `Next follow-up: ${updates.nextFollowUp}`,
          entityId: id,
          entityType: 'Lead',
        });
      }

      return this.getLeads();
    }
    return FALLBACK_LEADS.map((l) => (l.id === id ? { ...l, ...updates } : l));
  },

  /* ── JOBS ──────────────────────────────────────────────────────────────── */

  async getJobs(): Promise<Job[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('[Rivet] getJobs:', error.message);
      if (data && data.length > 0) {
        const jobs = (data as Record<string, unknown>[]).map(mapJob);
        for (const job of jobs) {
          const notes = await _loadNotes(job.id);
          job.notes = notes.map(n => ({ ...n })) as JobNote[];
        }
        return jobs;
      }
    }
    return FALLBACK_JOBS;
  },

  async updateJobStatus(
    id: string,
    status: JobStatus,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<Job[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('jobs').update({
        status,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw new Error(`[Rivet] updateJobStatus: ${error.message}`);

      await _logActivity({
        workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'job',
        title: `Job status updated to ${status}`,
        description: `Job ${id} → ${status}`,
        entityId: id,
        entityType: 'Job',
      });

      return this.getJobs();
    }
    return FALLBACK_JOBS.map((j) => (j.id === id ? { ...j, status } : j));
  },

  /* ── TASKS ─────────────────────────────────────────────────────────────── */

  async getTasks(): Promise<TaskRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('[Rivet] getTasks:', error.message);
      if (data && data.length > 0) return (data as Record<string, unknown>[]).map(mapTask);
    }
    return FALLBACK_TASKS;
  },

  async createTask(
    task: {
      title: string;
      type: TaskType;
      priority: TaskPriority;
      dueDateTime: string;
      assignee: string;
      linkedEntityId?: string;
      linkedEntityType?: TaskRecord['linkedEntityType'];
      linkedEntityName?: string;
      notes?: string;
    },
    workspaceId: string = DEV_WORKSPACE_ID,
    actor?: { id?: string; name?: string }
  ): Promise<TaskRecord[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').insert({
        workspace_id: workspaceId,
        title: task.title,
        type: task.type,
        status: 'Open',
        priority: task.priority,
        due_date_time: task.dueDateTime,
        assignee: task.assignee,
        linked_entity_id: task.linkedEntityId || null,
        linked_entity_type: task.linkedEntityType || null,
        linked_entity_name: task.linkedEntityName || null,
        notes: task.notes || null,
      });
      if (error) throw new Error(`[Rivet] createTask: ${error.message}`);

      await _logActivity({
        workspaceId,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'task',
        title: 'Task created',
        description: `"${task.title}" assigned to ${task.assignee}, due ${task.dueDateTime}`,
        entityType: 'Task',
      });

      return this.getTasks();
    }
    return [{ id: `tsk-${Date.now()}`, status: 'Open', ...task }, ...FALLBACK_TASKS];
  },

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<TaskRecord[]> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').update({
        status,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw new Error(`[Rivet] updateTaskStatus: ${error.message}`);

      if (status === 'Done') {
        await _logActivity({
          workspaceId: actor?.workspaceId || DEV_WORKSPACE_ID,
          actorId: actor?.id,
          actorName: actor?.name,
          category: 'task',
          title: 'Task completed',
          description: `Task marked as Done`,
          entityId: id,
          entityType: 'Task',
        });
      }

      return this.getTasks();
    }
    return FALLBACK_TASKS.map((t) => (t.id === id ? { ...t, status } : t));
  },

  /* ── PAYMENTS ──────────────────────────────────────────────────────────── */

  async getPayments(): Promise<PaymentRecord[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('[Rivet] getPayments:', error.message);
      if (data && data.length > 0) {
        const payments = (data as Record<string, unknown>[]).map(mapPayment);
        for (const payment of payments) {
          const notes = await _loadNotes(payment.id);
          payment.notes = notes.map(n => ({ ...n })) as PaymentNote[];
        }
        return payments;
      }
    }
    return FALLBACK_PAYMENTS;
  },

  async recordPaymentCollection(
    id: string,
    amount: number,
    method: string,
    noteText?: string,
    actor?: { id?: string; name?: string; workspaceId?: string }
  ): Promise<PaymentRecord[]> {
    const workspaceId = actor?.workspaceId || DEV_WORKSPACE_ID;

    if (isSupabaseConfigured) {
      const { data: current, error: fetchErr } = await supabase
        .from('payments')
        .select('amount_paid, total_amount, balance_due, payment_code, service_title')
        .eq('id', id)
        .single();
      if (fetchErr || !current) throw new Error(`[Rivet] recordPaymentCollection fetch: ${fetchErr?.message}`);

      const newPaid = Number(current.amount_paid) + amount;
      const newDue = Math.max(0, Number(current.total_amount) - newPaid);
      const newStatus: PaymentStatus = newDue === 0 ? 'Paid' : 'Partial';

      const { error: updateErr } = await supabase.from('payments').update({
        amount_paid: newPaid,
        balance_due: newDue,
        status: newStatus,
        payment_method: method,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (updateErr) throw new Error(`[Rivet] recordPaymentCollection update: ${updateErr.message}`);

      const noteBody = noteText || `Recorded ₹${amount.toLocaleString('en-IN')} via ${method}`;
      await supabase.from('notes').insert({
        workspace_id: workspaceId,
        linked_entity_id: id,
        linked_entity_type: 'Payment',
        author_id: actor?.id || null,
        author_name: actor?.name || 'Janai Desk',
        text: noteBody,
      });

      await _logActivity({
        workspaceId,
        actorId: actor?.id,
        actorName: actor?.name,
        category: 'payment',
        title: 'Payment recorded',
        description: `₹${amount.toLocaleString('en-IN')} via ${method} — ${current.service_title}. Status: ${newStatus}`,
        entityId: id,
        entityType: 'Payment',
      });

      return this.getPayments();
    }

    return FALLBACK_PAYMENTS.map((p) => {
      if (p.id !== id) return p;
      const newPaid = p.amountPaid + amount;
      const newDue = Math.max(0, p.totalAmount - newPaid);
      return { ...p, amountPaid: newPaid, balanceDue: newDue, paymentMethod: method, status: newDue === 0 ? 'Paid' : 'Partial' };
    });
  },

  /* ── NOTES ─────────────────────────────────────────────────────────────── */

  async addNote(
    entityId: string,
    entityType: 'Lead' | 'Job' | 'Payment' | 'Customer',
    text: string,
    authorId?: string,
    authorName?: string,
    workspaceId: string = DEV_WORKSPACE_ID
  ): Promise<LeadNote> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notes').insert({
        workspace_id: workspaceId,
        linked_entity_id: entityId,
        linked_entity_type: entityType,
        author_id: authorId || null,
        author_name: authorName || 'Janai Desk',
        text,
      }).select().single();
      if (error) throw new Error(`[Rivet] addNote: ${error.message}`);
      return mapNote(data as Record<string, unknown>);
    }
    return { id: `n-${Date.now()}`, author: authorName || 'Janai Desk', timestamp: 'Just now', text };
  },
};
