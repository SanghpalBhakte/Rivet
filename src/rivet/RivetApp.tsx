import React, { useState, useEffect } from 'react';
import './styles/rivet.css';
import { ActiveModule } from './types/rivet';
import { AppShell } from './components/shell/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { JobsView } from './components/jobs/JobsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { CustomersView } from './components/customers/CustomersView';
import { TasksView } from './components/tasks/TasksView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { AppLoadingShell } from './components/ui/AppLoadingShell';

interface RivetAppProps {
  onBackToPortfolio?: () => void;
}

// FIX: Use import.meta.env.BASE_URL instead of hardcoding '/Rivet'
// This works correctly on any deployment path (local, /Rivet/, custom subdomain, etc.)
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

const getInitialTab = (): ActiveModule => {
  if (typeof window === 'undefined') return 'dashboard';

  const validTabs: ActiveModule[] = ['dashboard', 'leads', 'jobs', 'payments', 'customers', 'tasks'];

  // Strip the base prefix before parsing the path segment
  const fullPath = window.location.pathname;
  const relativePath = BASE ? fullPath.replace(new RegExp(`^${BASE}`), '') : fullPath;
  const pathSegments = relativePath.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1]?.toLowerCase();

  if (lastSegment && validTabs.includes(lastSegment as ActiveModule)) {
    return lastSegment as ActiveModule;
  }

  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (validTabs.includes(hash as ActiveModule)) {
    return hash as ActiveModule;
  }

  return 'dashboard';
};

// Signed-out landing screen — shown when bootstrap is complete but user is null
const AuthGate: React.FC = () => {
  const { openAuthModal } = useAuth();
  return (
    <div className="rv-auth-gate">
      <div className="rv-auth-gate__inner">
        <div className="rv-auth-gate__logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="rgba(94,234,212,0.1)" stroke="rgba(94,234,212,0.3)" strokeWidth="1"/>
            <path d="M8 10h10M8 16h8M8 22h12" stroke="#5eead4" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="23" cy="16" r="4" stroke="#5eead4" strokeWidth="2"/>
          </svg>
          <span className="rv-auth-gate__logo-text">RIVET</span>
        </div>
        <h1 className="rv-auth-gate__title">Operations Control Room</h1>
        <p className="rv-auth-gate__desc">
          Sign in to access your workspace, dispatch queue, and operational data.
        </p>
        <button className="rv-btn rv-btn--primary rv-btn--lg" onClick={openAuthModal}>
          Sign In
        </button>
      </div>
      <AuthModal />
    </div>
  );
};

const RivetAppContent: React.FC<RivetAppProps> = ({ onBackToPortfolio }) => {
  const { user, bootstrapping, bootstrapError, retryBootstrap, dismissBootstrapError } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveModule>(getInitialTab);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tab: ActiveModule) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      // FIX: Use the BASE constant derived from import.meta.env.BASE_URL
      const targetPath = tab === 'dashboard' ? `${BASE}/` : `${BASE}/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  // Bootstrapping: auth session being resolved
  if (bootstrapping) {
    return <AppLoadingShell />;
  }

  // Bootstrap failed or timed out
  if (bootstrapError) {
    return (
      <AppLoadingShell
        errorMsg={bootstrapError}
        onRetry={retryBootstrap}
        onContinueOffline={dismissBootstrapError}
      />
    );
  }

  // FIX: Auth gate — unauthenticated users see a sign-in screen, not the app
  if (!user) {
    return <AuthGate />;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Optional top banner when running in portfolio demo mode */}
      {onBackToPortfolio && (
        <div
          style={{
            background: '#161b22',
            borderBottom: '1px solid #30363d',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#8b949e',
          }}
        >
          <div>
            <strong>RIVET Control Room</strong> — Central HQ Service Ops
          </div>
          <button
            onClick={onBackToPortfolio}
            style={{
              background: '#21262d',
              border: '1px solid #363b42',
              color: '#c9d1d9',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            ← Back to Portfolio
          </button>
        </div>
      )}

      <AppShell activeTab={activeTab} onSelectTab={handleSelectTab}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'jobs' && <JobsView />}
        {activeTab === 'payments' && <PaymentsView />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'tasks' && <TasksView />}
      </AppShell>

      <AuthModal />
    </div>
  );
};

export const RivetApp: React.FC<RivetAppProps> = (props) => {
  return (
    <AuthProvider>
      <RivetAppContent {...props} />
    </AuthProvider>
  );
};

export default RivetApp;
