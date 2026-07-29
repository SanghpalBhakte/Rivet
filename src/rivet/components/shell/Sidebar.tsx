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
      {/* Brand & Workspace */}
      <div className="rv-sidebar__header">
        <div className="rv-sidebar__brand">
          <span className="rv-sidebar__logo">RIVET</span>
        </div>
        <div className="rv-sidebar__workspace">
          <span style={{ fontWeight: 600, color: 'var(--rv-text-primary)', fontSize: '12px' }}>Central HQ CRM</span>
          <span style={{ fontSize: '10px', color: 'var(--rv-text-muted)' }}>
            {isConfigured ? '⚡ Supabase Postgres DB' : '🔒 Local Persistent DB'}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="rv-sidebar__nav">
        <button
          className={`rv-sidebar__link ${activeTab === 'dashboard' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span>
            <span>Control Room</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'leads' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('leads')}
          aria-current={activeTab === 'leads' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span>
            <span>Leads & Inquiries</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'jobs' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('jobs')}
          aria-current={activeTab === 'jobs' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚚</span>
            <span>Dispatch Jobs</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'payments' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('payments')}
          aria-current={activeTab === 'payments' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💳</span>
            <span>Payments Ledger</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'customers' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('customers')}
          aria-current={activeTab === 'customers' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👥</span>
            <span>Customers & Accounts</span>
          </span>
        </button>

        <button
          className={`rv-sidebar__link ${activeTab === 'tasks' ? 'rv-sidebar__link--active' : ''}`}
          onClick={() => onSelectTab && onSelectTab('tasks')}
          aria-current={activeTab === 'tasks' ? 'page' : undefined}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔔</span>
            <span>Tasks & Reminders</span>
          </span>
        </button>
      </nav>

      {/* Auth & User Session Identity Card */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--rv-border-subtle)', background: 'var(--rv-bg-surface-elevated)', margin: '0 8px 8px 8px', borderRadius: '6px' }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rv-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </span>
              <Badge variant={user.role === 'admin' ? 'completed' : user.role === 'accounts' ? 'callback' : 'job'}>
                {user.role.toUpperCase()}
              </Badge>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--rv-text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setIsWsModalOpen(true)}
                style={{ flex: 1, background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', color: 'var(--rv-brand)', padding: '3px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                ⚙️ Workspace
              </button>
              <button
                onClick={() => signOut()}
                style={{ flex: 1, background: 'var(--rv-bg-base)', border: '1px solid var(--rv-border-default)', color: 'var(--rv-text-secondary)', padding: '3px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginBottom: '6px' }}>
              Guest Session
            </div>
            <button
              onClick={openAuthModal}
              style={{ width: '100%', background: 'var(--rv-brand-bg)', border: '1px solid var(--rv-brand-border)', color: 'var(--rv-brand)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              🔑 Sign In / Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Footer System Status & Deployment Marker */}
      <div className="rv-sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span className="rv-sidebar__status-dot" aria-hidden="true" />
          <span style={{ color: 'var(--rv-text-secondary)' }}>Central Ops Live</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--rv-text-dim)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          v{BUILD_INFO.version} • cf-pages@{BUILD_INFO.commitHash}
        </div>
      </div>

      <WorkspaceModal
        isOpen={isWsModalOpen}
        onClose={() => setIsWsModalOpen(false)}
      />
    </aside>
  );
};


