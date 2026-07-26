import React, { useState, useMemo } from 'react';
import { INITIAL_JOBS } from '../../data/mockData';
import { Job, JobStatus, SimulationMode } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { JobRow } from './JobRow';
import { JobDetailDrawer } from './JobDetailDrawer';

export const JobsView: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [simMode, setSimMode] = useState<SimulationMode>('normal');

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

  // Status update handler
  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    const statusNoteText = `Job status updated to ${newStatus}`;
    const newNote = {
      id: `jn-${Date.now()}`,
      author: 'Janai Ops',
      timestamp: 'Just now',
      text: statusNoteText,
    };
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: newStatus, notes: [newNote, ...j.notes] }
          : j
      )
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) =>
        prev
          ? { ...prev, status: newStatus, notes: [newNote, ...prev.notes] }
          : null
      );
    }
  };

  // Add note handler
  const handleAddNote = (jobId: string, noteText: string) => {
    const newNote = {
      id: `jn-${Date.now()}`,
      author: 'Janai Ops',
      timestamp: 'Just now',
      text: noteText,
    };
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, notes: [newNote, ...j.notes] } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
      );
    }
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

      {/* Main Jobs Control Card */}
      <Card dense className="rv-card--hero">
        {/* Search & Filter Bar */}
        <div className="rv-leads-bar">
          {/* Search Input */}
          <div className="rv-search-wrapper">
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
            description="Try clearing your search query or selecting a different status tab."
          />
        ) : (
          <ul className="rv-queue-list" role="list">
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
    </div>
  );
};
