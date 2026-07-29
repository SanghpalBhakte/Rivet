import React, { useState, useMemo, useEffect } from 'react';
import { Job, JobStatus, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { JobRow } from './JobRow';
import { JobDetailDrawer } from './JobDetailDrawer';
import { NewJobModal } from './NewJobModal';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const JobsView: React.FC = () => {
  const { user } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  useEffect(() => {
    ApiService.getJobs().then(setJobs);
  }, []);

  // Filter jobs by search query and status filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.customerName.toLowerCase().includes(q) ||
        job.customerPhone.toLowerCase().includes(q) ||
        job.serviceTitle.toLowerCase().includes(q) ||
        job.jobCode.toLowerCase().includes(q) ||
        job.driverName.toLowerCase().includes(q) ||
        job.vehicleDetails.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchQuery]);

  // Advance status progression quick action
  const handleQuickAction = (job: Job) => {
    let nextStatus: JobStatus = job.status;
    if (job.status === 'Scheduled') nextStatus = 'In Progress';
    else if (job.status === 'In Progress') nextStatus = 'Completed';
    else if (job.status === 'Cancelled') nextStatus = 'Scheduled';

    handleUpdateStatus(job.id, nextStatus);
  };

  // Status update handler — persists to Supabase + logs activity
  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    ApiService.updateJobStatus(jobId, newStatus, actor)
      .then((updatedJobs) => {
        setJobs(updatedJobs);
        if (selectedJob && selectedJob.id === jobId) {
          const reFetched = updatedJobs.find((j) => j.id === jobId) || null;
          setSelectedJob(reFetched);
        }
      })
      .catch(console.error);
  };

  // Add note handler — persists to Supabase
  const handleAddNote = (jobId: string, noteText: string) => {
    ApiService.addNote(jobId, 'Job', noteText, actor.id, actor.name, actor.workspaceId)
      .then((newNote) => {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, notes: [newNote, ...j.notes] } : j
          )
        );
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob((prev) =>
            prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
          );
        }
      })
      .catch(console.error);
  };

  // Status counts for tab badges
  const getStatusCount = (st: 'All' | JobStatus) => {
    if (st === 'All') return jobs.length;
    return jobs.filter((j) => j.status === st).length;
  };

  const STATUS_FILTERS: ('All' | JobStatus)[] = [
    'All',
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled',
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Jobs & Dispatch Work Orders"
        subline="Janai Tours & Service Ops • Confirmed work dispatches, driver assignment, & service delivery"
        simMode={simMode}
        onSimModeChange={setSimMode}
      />

      {/* Top Counters Strip for Jobs V2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Work Orders
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)', marginTop: '2px' }}>
            {jobs.length}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Scheduled
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-callback-text)', marginTop: '2px' }}>
            {getStatusCount('Scheduled')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-job-text)', marginTop: '2px' }}>
            {getStatusCount('In Progress')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-completed-text)', marginTop: '2px' }}>
            {getStatusCount('Completed')}
          </div>
        </div>

        <div style={{ background: 'var(--rv-bg-surface)', border: '1px solid var(--rv-border-default)', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cancelled
          </div>
          <div className="rv-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rv-status-overdue-text)', marginTop: '2px' }}>
            {getStatusCount('Cancelled')}
          </div>
        </div>
      </div>

      {/* Exception & Dispatch Alert Area */}
      {getStatusCount('Scheduled') > 0 && (
        <div
          style={{
            background: 'var(--rv-bg-surface-elevated)',
            border: '1px solid var(--rv-status-callback-border)',
            borderLeft: '3px solid var(--rv-status-callback-text)',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '12px' }}>
            <strong style={{ color: 'var(--rv-status-callback-text)' }}>⚡ Active Dispatch Alert:</strong>{' '}
            <span style={{ color: 'var(--rv-text-primary)' }}>
              {getStatusCount('Scheduled')} vehicle dispatches awaiting departure confirmation for today's pickup schedule.
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 600 }}>
            Desk Operator: Central HQ Dispatch
          </span>
        </div>
      )}

      {/* Main Jobs Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search & Filter Bar with New Job Button */}
        <div className="rv-leads-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {/* Search Input */}
            <div className="rv-search-wrapper" style={{ flex: 1 }}>
              <span className="rv-search-icon">🔍</span>
              <input
                type="text"
                className="rv-search-input"
                placeholder="Search work order #, customer, driver, vehicle, or route..."
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
            <div className="rv-queue-tabs" role="tablist" aria-label="Filter jobs by status">
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

          <Button variant="primary" size="sm" onClick={() => setIsNewJobModalOpen(true)}>
            + New Work Order
          </Button>
        </div>

        {/* Jobs List / Table */}
        {simMode === 'loading' ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : simMode === 'empty' || filteredJobs.length === 0 ? (
          <EmptyState
            icon="🚚"
            title="No work orders match your filter"
            description="Try clearing your search query, selecting a different status tab, or create a new work order."
          />
        ) : (
          <ul className="rv-queue-list" role="list" style={{ background: 'transparent' }}>
            {filteredJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onSelect={(selected) => setSelectedJob(selected)}
                onQuickAction={(targetJob) => handleQuickAction(targetJob)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
      />

      {/* New Job Modal */}
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onJobCreated={(updatedJobs) => setJobs(updatedJobs)}
      />
    </div>
  );
};
