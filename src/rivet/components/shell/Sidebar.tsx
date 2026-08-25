import React, { useState } from 'react';
import { ActiveModule } from '../../types/rivet';
import { BUILD_INFO } from '../../config/buildInfo';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { WorkspaceModal } from '../auth/WorkspaceModal';

interface SidebarProps {
  activeTab?: ActiveModule;
  onSelectTab?: (tab: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const { user, signOut, openAuthModal, isConfigured } = useAuth();
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);

  return (
    <aside className="rv-sidebar" aria-label="Main Navigation">
      {/* Brand & Workspace Identity */}
      <div className="rv-sidebar__header">
        <div className="rv-sidebar__brand">
          <span className="rv-sidebar__logo-badge">
            <span style={{ fontSize: '11px', opacity: 0.8 }}>⚡</span>
            <span>RIVET</span>
          </span>
          <span className="rv-kicker" style={{ fontSize: '10px' }}>v{BUILD_INFO.version}</span>
        </div>
        <div className="rv-sidebar__workspace-info">
          <span className="rv-sidebar__workspace-name">Central HQ Operations</span>
          <span className="rv-sidebar__workspace-role">
            <span className="rv-status-dot" style={{ width: '5px', height: '5px' }} />
            {isConfigured ? 'Live Postgres Connection' : 'Persistent Storage'}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="rv-sidebar__nav">
        <div className="rv-sidebar__nav-section-title">Operations</div>

        <button
          className={`rv-sidebar__link ${activeTab === 'dashboard' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>📊</span>
            <span>Control Room</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'leads' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('leads')}
          aria-current={activeTab === 'leads' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>📋</span>
            <span>Leads & Quotes</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'jobs' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('jobs')}
          aria-current={activeTab === 'jobs' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>🚚</span>
            <span>Dispatch Jobs</span>
          </span>
        </button>

        <div className="rv-sidebar__nav-section-title" style={{ marginTop: '8px' }}>Accounts & Tasks</div>

        <button
          className={`rv-sidebar__link ${activeTab === 'tasks' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('tasks')}
          aria-current={activeTab === 'tasks' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>🔔</span>
            <span>Tasks & Queue</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'payments' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('payments')}
          aria-current={activeTab === 'payments' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>💳</span>
            <span>Payments Ledger</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'customers' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('customers')}
          aria-current={activeTab === 'customers' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ opacity: 0.85 }}>👥</span>
            <span>Customer Accounts</span>
          </span>
        </button>
      </nav>

      {/* User Session Identity Card */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rv-border-subtle)', background: 'var(--rv-bg-elevated)', margin: '0 8px 10px', borderRadius: '8px' }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--rv-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </span>
              <Badge variant={user.role === 'admin' ? 'completed' : user.role === 'accounts' ? 'callback' : 'job'}>
                {user.role}
              </Badge>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--rv-text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsWsModalOpen(true)}
                className="rv-btn rv-btn--ghost rv-btn--sm"
                style={{ flex: 1, padding: '3px 6px', fontSize: '10.5px', border: '1px solid var(--rv-border-default)' }}
              >
                ⚙️ Workspace
              </button>
              <button
                onClick={() => signOut()}
                className="rv-btn rv-btn--ghost rv-btn--sm"
                style={{ flex: 1, padding: '3px 6px', fontSize: '10.5px', border: '1px solid var(--rv-border-default)' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginBottom: '6px' }}>
              Guest Operator Session
            </div>
            <button
              onClick={openAuthModal}
              className="rv-btn rv-btn--primary rv-btn--sm"
              style={{ width: '100%' }}
            >
              🔑 Operator Sign In
            </button>
          </div>
        )}
      </div>

      {/* Footer System Status Marker */}
      <div className="rv-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px' }}>
          <span style={{ color: 'var(--rv-text-muted)' }}>Operations Core</span>
          <span className="rv-mono" style={{ color: 'var(--rv-text-dim)' }}>@{BUILD_INFO.commitHash}</span>
        </div>
      </div>

      <WorkspaceModal
        isOpen={isWsModalOpen}
        onClose={() => setIsWsModalOpen(false)}
      />
    </aside>
  );
};
