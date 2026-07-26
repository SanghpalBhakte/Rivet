export type QueueItemType = 'overdue' | 'callback' | 'job';
export type QueueItemStatus = 'pending' | 'in_progress' | 'completed';
export type QueuePriority = 'critical' | 'high' | 'normal';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  title: string;
  context: string;
  clientName: string;
  clientPhone: string;
  dueTime: string;
  dueDate: string;
  status: QueueItemStatus;
  priority: QueuePriority;
  actionLabel: string;
  actionType: 'call' | 'quote' | 'dispatch' | 'note' | 'verify';
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  urgent?: boolean;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'lead' | 'quote' | 'callback' | 'job' | 'payment';
}

export type PipelineStageName = 
  | 'New' 
  | 'Contacted' 
  | 'Quote Sent' 
  | 'Confirmed' 
  | 'Completed' 
  | 'Closed' 
  | 'Lost';

export interface PipelineStage {
  stage: PipelineStageName;
  count: number;
}

export type SimulationMode = 'normal' | 'loading' | 'empty' | 'error';

/* --------------------------------------------------------------------------
   Leads Module Types
   -------------------------------------------------------------------------- */
export type LeadStage = 'New' | 'Contacted' | 'Quote Sent' | 'Confirmed' | 'Closed' | 'Lost';
export type LeadSource = 'WhatsApp' | 'Website' | 'Phone Call' | 'Referral';

export interface LeadNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceTitle: string;
  source: LeadSource;
  stage: LeadStage;
  budget: string;
  quoteAmount?: string;
  quoteStatus?: string;
  nextFollowUp: string;
  assignee: string;
  notes: LeadNote[];
  createdAt: string;
  primaryActionLabel: string;
}

/* --------------------------------------------------------------------------
   Jobs Module Types
   -------------------------------------------------------------------------- */
export type JobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface JobNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface PaymentSnapshot {
  totalAmount: string;
  advancePaid: string;
  dueAmount: string;
  paymentMethod: string;
  status: 'Pending' | 'Partial' | 'Paid';
}

export interface Job {
  id: string;
  jobCode: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  scheduledDateTime: string;
  status: JobStatus;
  driverName: string;
  vehicleDetails: string;
  pickupLocation: string;
  dropLocation: string;
  payment: PaymentSnapshot;
  notes: JobNote[];
  primaryActionLabel: string;
}

/* --------------------------------------------------------------------------
   Payments Module Types
   -------------------------------------------------------------------------- */
export type PaymentStatus = 'Paid' | 'Partial' | 'Due Soon' | 'Overdue';

export interface PaymentNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface PaymentRecord {
  id: string;
  paymentCode: string;
  customerName: string;
  customerPhone: string;
  jobCode: string;
  serviceTitle: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  paymentMethod: string;
  status: PaymentStatus;
  notes: PaymentNote[];
  primaryActionLabel: string;
}

export type ActiveModule = 'dashboard' | 'leads' | 'jobs' | 'payments';
