import React from 'react';

interface SidebarProps {
  activeTab?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard' }) => {
  return (
    <aside className="rv-sidebar" aria-label="Main Navigation">
      {/* Brand & Workspace */}
      <div className="rv-sidebar__header">
        <div className="rv-sidebar__brand">
          <span className="rv-sidebar__logo">RIVET</span>
          <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', fontWeight: 500 }}>
            v1.0 • Ops
          </span>
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
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span>Dashboard</span>
          <span className="rv-num" style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>Overview</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          title="Leads module coming in Phase 2"
        >
          <span>Leads</span>
          <span className="rv-sidebar__badge-soon">Soon</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          title="Customers module coming soon"
        >
          <span>Customers</span>
          <span className="rv-sidebar__badge-soon">Soon</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          title="Jobs module coming soon"
        >
          <span>Jobs</span>
          <span className="rv-sidebar__badge-soon">Soon</span>
        </button>

        <button
          className="rv-sidebar__link rv-sidebar__link--disabled"
          disabled
          title="Payments module coming soon"
        >
          <span>Payments</span>
          <span className="rv-sidebar__badge-soon">Soon</span>
        </button>
      </nav>

      {/* Footer System Status */}
      <div className="rv-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="rv-sidebar__status-dot" aria-hidden="true" />
          <span>System Nominal</span>
        </div>
        <span className="rv-num">100% Sync</span>
      </div>
    </aside>
  );
};
