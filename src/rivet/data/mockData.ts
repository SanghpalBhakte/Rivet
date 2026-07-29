import { QueueItem, SummaryMetric, ActivityItem, PipelineStage, Lead, Job, PaymentRecord, CustomerRecord, TaskRecord } from '../types/rivet';

/* --------------------------------------------------------------------------
   Streamlined Initial Mock Data — Clean Slate Operations
   -------------------------------------------------------------------------- */

export const INITIAL_QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'q-101',
    type: 'callback',
    title: 'Leh-Ladakh Tour Flight Verification',
    context: 'Verify seat availability & group rate confirmation',
    clientName: 'Dr. Neha Verma',
    clientPhone: '+91 97654 32109',
    dueTime: 'Today, 2:30 PM',
    dueDate: '2026-07-27',
    status: 'pending',
    priority: 'high',
    actionLabel: 'Log Call Note',
    actionType: 'note',
  },
  {
    id: 'q-102',
    type: 'job',
    title: 'Airport Transfer — Flight AI-441',
    context: 'Innova Crysta dispatched • Driver: Suresh M.',
    clientName: 'Priya Mehta',
    clientPhone: '+91 91588 22104',
    dueTime: 'Today, 5:00 PM',
    dueDate: '2026-07-27',
    status: 'in_progress',
    priority: 'high',
    actionLabel: 'Track Dispatch',
    actionType: 'dispatch',
  },
];

export const INITIAL_SUMMARY_METRICS: SummaryMetric[] = [
  {
    id: 'm-1',
    label: 'Unassigned Inquiries',
    value: 1,
    subtext: 'Requires quote response',
    urgent: false,
  },
  {
    id: 'm-2',
    label: 'Pending Follow-ups',
    value: 1,
    subtext: '1 high priority callback',
    urgent: true,
  },
  {
    id: 'm-3',
    label: 'Active Jobs Today',
    value: 0,
    subtext: 'No vehicles in transit',
    urgent: false,
  },
  {
    id: 'm-4',
    label: 'Outstanding Balance',
    value: '₹0',
    subtext: 'All clear today',
    urgent: false,
  },
];

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  { stage: 'New', count: 1 },
  { stage: 'Contacted', count: 0 },
  { stage: 'Quote Sent', count: 1 },
  { stage: 'Confirmed', count: 0 },
  { stage: 'Completed', count: 0 },
  { stage: 'Closed', count: 0 },
];

export const INITIAL_RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '10:45 AM',
    title: 'Quote Sent',
    description: 'Sent revised quote #JN-892 to Rajesh Sharma',
    category: 'quote',
  },
  {
    id: 'act-2',
    timestamp: '09:30 AM',
    title: 'System Note',
    description: 'Workspace successfully initialized and ready.',
    category: 'lead',
  },
];

/* --------------------------------------------------------------------------
   Leads Module Initial Data
   -------------------------------------------------------------------------- */
export const INITIAL_LEADS: Lead[] = [
  {
    id: 'ld-501',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98230 11452',
    customerEmail: 'rajesh.sharma@example.com',
    serviceTitle: 'Manali 5D/4N Customized Package',
    source: 'WhatsApp',
    stage: 'Quote Sent',
    budget: '₹45,000',
    quoteAmount: '₹45,000',
    quoteStatus: 'Quote #JN-892 Sent (Pending Client)',
    nextFollowUp: 'Today, 4:00 PM',
    assignee: 'Janai Desk',
    createdAt: '2026-07-25',
    primaryActionLabel: 'Mark Confirmed',
    notes: [
      {
        id: 'n-1',
        author: 'Janai Desk',
        timestamp: 'Yesterday 4:30 PM',
        text: 'Client requested 4-star hotel upgrade near Mall Road.',
      },
    ],
  },
  {
    id: 'ld-502',
    customerName: 'Dr. Neha Verma',
    customerPhone: '+91 97654 32109',
    customerEmail: 'neha.verma@cityhospital.org',
    serviceTitle: 'Leh-Ladakh 7-Day Group Flight Tour',
    source: 'Referral',
    stage: 'Quote Sent',
    budget: '₹1,80,000',
    quoteAmount: '₹1,75,000',
    quoteStatus: 'Quote #JN-904 Sent (Seats Held)',
    nextFollowUp: 'Today, 2:30 PM',
    assignee: 'Janai Desk',
    createdAt: '2026-07-23',
    primaryActionLabel: 'Mark Confirmed',
    notes: [
      {
        id: 'n-2',
        author: 'Janai Desk',
        timestamp: 'Jul 26, 6:00 PM',
        text: 'Waiting for flight seat confirmation for group of 6 adults.',
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   Jobs Module Initial Data
   -------------------------------------------------------------------------- */
export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-901',
    jobCode: 'JOB-901',
    customerName: 'Priya Mehta',
    customerPhone: '+91 91588 22104',
    serviceTitle: 'Airport Drop Transfer',
    scheduledDateTime: 'Today, 5:00 PM',
    driverName: 'Suresh M.',
    vehicleDetails: 'Innova Crysta (MH-31 FC 8820)',
    status: 'Scheduled',
    pickupLocation: 'Civil Lines',
    dropLocation: 'Airport Terminal',
    primaryActionLabel: 'Track Dispatch',
    notes: [
      {
        id: 'jn-1',
        author: 'Janai Desk',
        timestamp: 'Jul 27, 2:00 PM',
        text: 'Flight departure 7:30 PM. Needs luggage assistance.',
      },
    ],
    payment: {
      totalAmount: '₹2,400',
      advancePaid: '₹2,400',
      dueAmount: '₹0 (Paid)',
      paymentMethod: 'UPI (PhonePe)',
      status: 'Paid',
    },
  },
  {
    id: 'job-902',
    jobCode: 'JOB-902',
    customerName: 'Vikram Rao',
    customerPhone: '+91 98220 55410',
    serviceTitle: 'Pachmarhi 3D/2N Outstation Trip',
    scheduledDateTime: 'Tomorrow, 6:00 AM',
    driverName: 'Ramesh K.',
    vehicleDetails: 'Ertiga (MH-31 EA 1102)',
    status: 'In Progress',
    pickupLocation: 'City Center',
    dropLocation: 'Pachmarhi MP',
    primaryActionLabel: 'Complete Trip',
    notes: [
      {
        id: 'jn-2',
        author: 'Janai Desk',
        timestamp: 'Jul 26, 8:00 PM',
        text: 'Family trip of 4 adults. Tolls & driver allowance included.',
      },
    ],
    payment: {
      totalAmount: '₹28,000',
      advancePaid: '₹14,000',
      dueAmount: '₹14,000 Due',
      paymentMethod: 'Bank Transfer',
      status: 'Partial',
    },
  },
];

/* --------------------------------------------------------------------------
   Payments Module Initial Data
   -------------------------------------------------------------------------- */
export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-701',
    paymentCode: 'INV-701',
    jobCode: 'JOB-901',
    customerName: 'Priya Mehta',
    customerPhone: '+91 91588 22104',
    serviceTitle: 'Airport Drop Transfer',
    totalAmount: 2400,
    amountPaid: 2400,
    balanceDue: 0,
    dueDate: '2026-07-27',
    paymentMethod: 'UPI (PhonePe)',
    status: 'Paid',
    primaryActionLabel: 'View Summary',
    notes: [
      {
        id: 'pn-1',
        author: 'System',
        timestamp: 'Jul 27, 2:15 PM',
        text: 'Recorded full payment ₹2,400 via PhonePe UPI.',
      },
    ],
  },
  {
    id: 'pay-702',
    paymentCode: 'INV-702',
    jobCode: 'JOB-902',
    customerName: 'Sanjay Deshmukh',
    customerPhone: '+91 99700 44512',
    serviceTitle: 'Ashtavinayak Tour retainer',
    totalAmount: 30000,
    amountPaid: 15000,
    balanceDue: 15000,
    dueDate: '2026-07-28',
    paymentMethod: 'Bank Transfer',
    status: 'Partial',
    primaryActionLabel: 'Record Payment',
    notes: [
      {
        id: 'pn-2',
        author: 'Accounts',
        timestamp: 'Jul 26, 11:00 AM',
        text: 'Received ₹15,000 advance via NEFT. Remaining balance due upon tour completion.',
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   Customers Module Initial Data
   -------------------------------------------------------------------------- */
export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-901',
    customerCode: 'CUST-101',
    name: 'Priya Mehta',
    phone: '+91 91588 22104',
    email: 'priya.mehta@gmail.com',
    city: 'Central',
    healthStatus: 'Repeat Client',
    latestServiceRef: 'JOB-901 • Airport Drop',
    lastActivityDate: 'Today, 2:15 PM',
    totalSpent: 18400,
    outstandingBalance: 0,
    nextFollowUp: 'Scheduled Transfer',
    primaryActionLabel: 'View Account',
    history: [
      {
        id: 'ch-1',
        date: 'Jul 27, 2:15 PM',
        type: 'payment',
        title: 'Payment Cleared',
        details: 'Full payment of ₹2,400 cleared for Airport Drop Transfer.',
        badgeLabel: 'Paid',
      },
    ],
  },
  {
    id: 'cust-902',
    customerCode: 'CUST-102',
    name: 'Dr. Neha Verma',
    phone: '+91 97654 32109',
    email: 'neha.verma@cityhospital.org',
    city: 'Central',
    healthStatus: 'Active Lead',
    latestServiceRef: 'LD-502 • Leh-Ladakh 7D Tour',
    lastActivityDate: 'Jul 26, 6:00 PM',
    totalSpent: 0,
    outstandingBalance: 0,
    nextFollowUp: 'Today, 2:30 PM',
    primaryActionLabel: 'View Account',
    history: [
      {
        id: 'ch-2',
        date: 'Jul 26, 6:00 PM',
        type: 'lead',
        title: 'Inquiry: Leh-Ladakh 7D Group Tour',
        details: 'Quote #JN-904 sent for ₹1,75,000. Waiting for flight seat confirmation.',
        badgeLabel: 'Quote Sent',
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   Tasks & Reminders Initial Data
   -------------------------------------------------------------------------- */
export const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 'tsk-001',
    title: 'Confirm flight seats',
    type: 'Quote Follow-up',
    status: 'Due Soon',
    priority: 'High',
    dueDateTime: 'Today, 4:00 PM',
    assignee: 'Janai Desk',
    linkedEntityId: 'ld-502',
    linkedEntityType: 'Lead',
    linkedEntityName: 'Dr. Neha Verma (Leh-Ladakh 7D)',
    notes: 'Checking Indigo group block availability.',
  },
  {
    id: 'tsk-002',
    title: 'Collect pending ₹15,000 advance balance',
    type: 'Payment Reminder',
    status: 'Open',
    priority: 'Normal',
    dueDateTime: 'Tomorrow, 10:00 AM',
    assignee: 'Accounts',
    linkedEntityId: 'pay-702',
    linkedEntityType: 'Payment',
    linkedEntityName: 'Sanjay Deshmukh (Ashtavinayak Tour)',
  },
];

export function createQuoteFollowUpTask(lead: Lead): TaskRecord {
  const newTask: TaskRecord = {
    id: `tsk-${Date.now()}`,
    title: `Send quote for ${lead.serviceTitle}`,
    type: 'Quote Follow-up',
    status: 'Due Soon',
    priority: 'High',
    dueDateTime: lead.nextFollowUp || 'Today, 6:00 PM',
    assignee: lead.assignee || 'Janai Desk',
    linkedEntityId: lead.id,
    linkedEntityType: 'Lead',
    linkedEntityName: `${lead.customerName} (${lead.serviceTitle})`,
    notes: `Auto-generated task from ${lead.source} Intake Bridge. Contact: ${lead.customerPhone}`,
  };

  INITIAL_TASKS.unshift(newTask);
  return newTask;
}
