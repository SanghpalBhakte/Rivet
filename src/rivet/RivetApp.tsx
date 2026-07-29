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
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

interface RivetAppProps {
  onBackToPortfolio?: () => void;
}

const getInitialTab = (): ActiveModule => {
  if (typeof window === 'undefined') return 'dashboard';
  
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const validTabs: ActiveModule[] = ['dashboard', 'leads', 'jobs', 'payments', 'customers', 'tasks'];
  
  if (validTabs.includes(path as ActiveModule)) {
    return path as ActiveModule;
  }

  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (validTabs.includes(hash as ActiveModule)) {
    return hash as ActiveModule;
  }

  return 'dashboard';
};

export const RivetApp: React.FC<RivetAppProps> = ({ onBackToPortfolio }) => {
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
      const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  return (
    <AuthProvider>
      <div style={{ position: 'relative' }}>
        {/* Optional top banner for switching back to portfolio when in demo mode */}
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
    </AuthProvider>
  );
};


export default RivetApp;
