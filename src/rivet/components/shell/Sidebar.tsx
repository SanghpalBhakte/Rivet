import React from 'react';
import { ActiveModule } from '../../types/rivet';

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
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          aria-disabled="true"
        >
          <span>Customers</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          aria-disabled="true"
        >
          <span>Jobs</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          aria-disabled="true"
        >
          <span>Payments</span>
        </button>
      </nav>

      {/* Footer System Status */}
      <div className="rv-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="rv-sidebar__status-dot" aria-hidden="true" />
          <span>Operations Active</span>
        </div>
      </div>
    </aside>
  );
};
