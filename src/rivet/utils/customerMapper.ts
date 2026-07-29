import { CustomerRecord, Lead, Job, PaymentRecord, TaskRecord, CustomerHistoryItem } from '../types/rivet';

export interface CustomerOperationalAccount {
  customer: CustomerRecord;
  linkedLeads: Lead[];
  linkedJobs: Job[];
  linkedPayments: PaymentRecord[];
  linkedTasks: TaskRecord[];
  timeline: CustomerHistoryItem[];
  counters: {
    totalInquiries: number;
    totalJobs: number;
    activeJobs: number;
    totalSpent: number;
    outstandingBalance: number;
    lastContactDate: string;
  };
  nextAction: {
    followUpDue: string;
    pendingPaymentText: string;
    activeJobText: string;
    latestNoteText: string;
    recommendedAction: string;
  };
}

export function getCustomerOperationalAccount(
  customer: CustomerRecord,
  allLeads: Lead[],
  allJobs: Job[],
  allPayments: PaymentRecord[],
  allTasks: TaskRecord[] = []
): CustomerOperationalAccount {
  const normPhone = customer.phone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
  const normName = customer.name.toLowerCase().trim();

  // 1. Match linked Leads
  const linkedLeads = allLeads.filter((l) => {
    const lPhone = l.customerPhone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    const lName = l.customerName.toLowerCase().trim();
    return (normPhone && lPhone && normPhone === lPhone) || normName.includes(lName) || lName.includes(normName);
  });

  // 2. Match linked Jobs
  const linkedJobs = allJobs.filter((j) => {
    const jButtonPhone = j.customerPhone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    const jName = j.customerName.toLowerCase().trim();
    return (normPhone && jButtonPhone && normPhone === jButtonPhone) || normName.includes(jName) || jName.includes(normName);
  });

  // 3. Match linked Payments
  const linkedPayments = allPayments.filter((p) => {
    const pPhone = p.customerPhone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    const pName = p.customerName.toLowerCase().trim();
    return (normPhone && pPhone && normPhone === pPhone) || normName.includes(pName) || pName.includes(normName);
  });

  // 4. Match linked Tasks
  const linkedTasks = allTasks.filter((t) => {
    if (t.linkedEntityId === customer.id) return true;
    const tName = t.linkedEntityName?.toLowerCase().trim() || '';
    return normName && tName && (normName.includes(tName) || tName.includes(normName));
  });

  // 5. Compute Counters
  const activeJobs = linkedJobs.filter((j) => j.status === 'Scheduled' || j.status === 'In Progress').length;
  
  // Calculate financial totals
  let computedTotalSpent = customer.totalSpent;
  let computedOutstanding = customer.outstandingBalance;

  if (linkedPayments.length > 0) {
    const totalPaidFromPayments = linkedPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    const totalDueFromPayments = linkedPayments.reduce((acc, p) => acc + p.balanceDue, 0);
    if (totalPaidFromPayments > 0 || totalDueFromPayments > 0) {
      computedTotalSpent = totalPaidFromPayments;
      computedOutstanding = totalDueFromPayments;
    }
  }

  // 6. Build Combined Timeline
  const combinedTimeline: CustomerHistoryItem[] = [...customer.history];

  // Add Lead Events to timeline
  linkedLeads.forEach((l) => {
    combinedTimeline.push({
      id: `timeline-lead-${l.id}`,
      date: l.createdAt || 'Recent',
      type: 'lead',
      title: `Inquiry: ${l.serviceTitle}`,
      details: `Stage: ${l.stage} • Source: ${l.source} • Budget/Quote: ${l.quoteAmount || l.budget}`,
      badgeLabel: l.stage,
    });
  });

  // Add Job Events to timeline
  linkedJobs.forEach((j) => {
    combinedTimeline.push({
      id: `timeline-job-${j.id}`,
      date: j.scheduledDateTime || 'Recent',
      type: 'job',
      title: `Work Order ${j.jobCode}: ${j.serviceTitle}`,
      details: `Status: ${j.status} • Driver: ${j.driverName} (${j.vehicleDetails}) • Pickup: ${j.pickupLocation}`,
      badgeLabel: j.status,
    });
  });

  // Add Payment Events to timeline
  linkedPayments.forEach((p) => {
    combinedTimeline.push({
      id: `timeline-pay-${p.id}`,
      date: p.dueDate || 'Recent',
      type: 'payment',
      title: `Payment ${p.paymentCode} for ${p.jobCode}`,
      details: `Status: ${p.status} • Total: ₹${p.totalAmount.toLocaleString()} • Paid: ₹${p.amountPaid.toLocaleString()} • Due: ₹${p.balanceDue.toLocaleString()}`,
      badgeLabel: p.status,
    });
  });

  // Add Task Reminders to timeline
  linkedTasks.forEach((t) => {
    combinedTimeline.push({
      id: `timeline-task-${t.id}`,
      date: t.dueDateTime || 'Recent',
      type: 'note',
      title: `Reminder (${t.type}): ${t.title}`,
      details: `Status: ${t.status} • Priority: ${t.priority} • Assignee: ${t.assignee}${t.notes ? ` • Note: ${t.notes}` : ''}`,
      badgeLabel: t.status,
    });
  });

  // Deduplicate and sort timeline
  const uniqueTimelineMap = new Map<string, CustomerHistoryItem>();
  combinedTimeline.forEach((item) => {
    uniqueTimelineMap.set(item.id, item);
  });
  const sortedTimeline = Array.from(uniqueTimelineMap.values());

  // 7. Next Action Guidance
  let recommendedAction = 'No immediate action required';
  let pendingPaymentText = 'No pending balance';
  let activeJobText = 'No active jobs in transit';
  let latestNoteText = sortedTimeline.find((t) => t.type === 'note')?.details || 'No recent internal notes recorded.';

  if (computedOutstanding > 0) {
    pendingPaymentText = `₹${computedOutstanding.toLocaleString('en-IN')} outstanding balance`;
    recommendedAction = `Collect pending balance of ₹${computedOutstanding.toLocaleString('en-IN')}`;
  } else if (activeJobs > 0) {
    const currentActiveJob = linkedJobs.find((j) => j.status === 'In Progress' || j.status === 'Scheduled');
    if (currentActiveJob) {
      activeJobText = `${currentActiveJob.jobCode} (${currentActiveJob.status}) • Driver: ${currentActiveJob.driverName}`;
      recommendedAction = `Track vehicle dispatch for ${currentActiveJob.jobCode}`;
    }
  } else if (linkedLeads.some((l) => l.stage === 'New' || l.stage === 'Contacted' || l.stage === 'Quote Sent')) {
    const activeLead = linkedLeads.find((l) => l.stage === 'New' || l.stage === 'Contacted' || l.stage === 'Quote Sent');
    if (activeLead) {
      recommendedAction = `Follow up on Lead ${activeLead.id.toUpperCase()} (${activeLead.stage})`;
    }
  }

  return {
    customer,
    linkedLeads,
    linkedJobs,
    linkedPayments,
    linkedTasks,
    timeline: sortedTimeline,
    counters: {
      totalInquiries: Math.max(linkedLeads.length, 1),
      totalJobs: linkedJobs.length,
      activeJobs: activeJobs,
      totalSpent: computedTotalSpent,
      outstandingBalance: computedOutstanding,
      lastContactDate: customer.lastActivityDate,
    },
    nextAction: {
      followUpDue: customer.nextFollowUp || 'Today',
      pendingPaymentText,
      activeJobText,
      latestNoteText,
      recommendedAction,
    },
  };
}
