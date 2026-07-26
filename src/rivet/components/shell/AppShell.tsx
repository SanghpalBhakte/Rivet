import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="rivet-app">
      <div className="rv-shell">
        <Sidebar activeTab="dashboard" />
        <div className="rv-main-wrapper">
          <MobileNav />
          <main id="rivet-main-content" tabIndex={-1} className="rv-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
