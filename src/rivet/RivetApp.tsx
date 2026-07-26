import React from 'react';
import './styles/rivet.css';
import { AppShell } from './components/shell/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';

export const RivetApp: React.FC = () => {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
};

export default RivetApp;
