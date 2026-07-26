import React, { useState } from 'react';
import './styles/rivet.css';
import { ActiveModule } from './types/rivet';
import { AppShell } from './components/shell/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { JobsView } from './components/jobs/JobsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { CustomersView } from './components/customers/CustomersView';

interface RivetAppProps {
  onBackToPortfolio?: () => void;
}

export const RivetApp: React.FC<RivetAppProps> = ({ onBackToPortfolio }) => {
  const [activeTab, setActiveTab] = useState<ActiveModule>('dashboard');

  return (
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
            <strong>RIVET Control Room</strong> — Janai Tours & Service Ops
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
            ← Back to Sanghpal's Portfolio
          </button>
        </div>
      )}

      <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'jobs' && <JobsView />}
        {activeTab === 'payments' && <PaymentsView />}
        {activeTab === 'customers' && <CustomersView />}
      </AppShell>
    </div>
  );
};

export default RivetApp;
