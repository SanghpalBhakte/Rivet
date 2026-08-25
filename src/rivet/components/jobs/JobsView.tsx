import React, { useState, useMemo, useEffect } from 'react';
import { Job, JobStatus } from '../../types/rivet';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { JobRow } from './JobRow';
import { JobDetailDrawer } from './JobDetailDrawer';
import { NewJobModal } from './NewJobModal';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const JobsView: React.FC = () => {
  const { user, can } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    ApiService.getJobs(user?.workspaceId)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [user?.workspaceId]);

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
    if (!can('job:update_status')) {
      alert(`Role "${user?.role}" does not have permission to update job dispatch status.`);
      return;
    }
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
      <PageHeader
        kicker="Dispatch Operations"
        title="Dispatch Jobs"
        subline="Active vehicle dispatches, driver assignments, route coordination, and live progress"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewJobModalOpen(true)}
          >
            + Create Dispatch Job
          </Button>
        }
      />

      <div className="rv-table-container">
        <div className="rv-table-header">
          {/* Status Filter Tabs */}
          <div className="rv-queue-tabs" role="tablist" aria-label="Filter dispatch jobs by status">
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
              placeholder="Search job code, driver, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Job List Rows */}
        {loading ? (
          <div style={{ padding: '16px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon="🚚"
            title={jobs.length === 0 ? "No Active Dispatch Jobs" : "No Matching Jobs Found"}
            description={
              jobs.length === 0
                ? "No dispatch jobs scheduled yet. Create your first vehicle work order or confirm an incoming customer lead."
                : "No jobs match your search or status filter. Try clearing filters."
            }
            action={
              jobs.length === 0 && (
                <Button variant="primary" size="md" onClick={() => setIsNewJobModalOpen(true)}>
                  + Schedule First Dispatch
                </Button>
              )
            }
          />
        ) : (
          <div className="rv-list-group">
            {filteredJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onSelect={setSelectedJob}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>

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
        onJobCreated={(newJobs) => {
          setJobs(newJobs);
          setSelectedJob(newJobs[0] || null);
        }}
      />
    </div>
  );
};
