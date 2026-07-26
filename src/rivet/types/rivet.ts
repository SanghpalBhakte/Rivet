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
