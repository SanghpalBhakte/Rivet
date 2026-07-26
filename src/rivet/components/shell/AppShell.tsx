import React from 'react';
import { ActiveModule } from '../../types/rivet';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  activeTab: ActiveModule;
  onSelectTab: (tab: ActiveModule) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  return (
    <div className="rivet-app">
      <div className="rv-shell">
        <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
        <div className="rv-main-wrapper">
          <MobileNav activeTab={activeTab} onSelectTab={onSelectTab} />
          <main id="rivet-main-content" tabIndex={-1} className="rv-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
