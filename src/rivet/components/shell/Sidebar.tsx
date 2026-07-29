import React from 'react';
import { ActiveModule } from '../../types/rivet';
import { BUILD_INFO } from '../../config/buildInfo';

interface SidebarProps {
  activeTab?: ActiveModule;
  onSelectTab?: (tab: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  return (
    <aside className="rv-sidebar" aria-label="Main Navigation">
      {/* Brand & Workspace */}
      <div className="rv-sidebar__header">
        <div className="rv-sidebar__brand">
          <span className="rv-sidebar__logo">RIVET</span>
        </div>
        <div className="rv-sidebar__workspace">
          <span style={{ fontWeight: 600, color: 'var(--rv-text-primary)' }}>Janai Tours & Ops</span>
          <span style={{ fontSize: '10px', color: 'var(--rv-text-dim)' }}>Nagpur</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="rv-sidebar__nav">
        <button
          className={`rv-sidebar__link ${activeTab === 'dashboard' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span>Dashboard</span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'leads' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('leads')}
          aria-current={activeTab === 'leads' ? 'page' : undefined}
        >
          <span>Leads</span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'jobs' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('jobs')}
          aria-current={activeTab === 'jobs' ? 'page' : undefined}
        >
          <span>Jobs</span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'payments' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('payments')}
          aria-current={activeTab === 'payments' ? 'page' : undefined}
        >
          <span>Payments</span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'customers' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('customers')}
          aria-current={activeTab === 'customers' ? 'page' : undefined}
        >
          <span>Customers</span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'tasks' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('tasks')}
          aria-current={activeTab === 'tasks' ? 'page' : undefined}
        >
          <span>Tasks & Reminders</span>
        </button>
      </nav>

      {/* Footer System Status & Deployment Marker */}
      <div className="rv-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span className="rv-sidebar__status-dot" aria-hidden="true" />
          <span>Operations Active</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--rv-text-dim)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          v{BUILD_INFO.version} • cf-pages@{BUILD_INFO.commitHash}
        </div>
      </div>
    </aside>
  );
};
