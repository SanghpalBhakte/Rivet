import React, { useState } from 'react';
import { ActiveModule } from '../../types/rivet';
import { Button } from '../ui/Button';

interface MobileNavProps {
  activeTab?: ActiveModule;
  onSelectTab?: (tab: ActiveModule) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (tab: ActiveModule) => {
    if (onSelectTab) onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      <header className="rv-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="rv-sidebar__logo">RIVET</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rv-text-secondary)' }}>
            Janai Ops
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? 'Close ✕' : 'Menu ☰'}
        </Button>
      </header>

      {isOpen && (
        <div
          className="rv-mobile-overlay"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <div
            className="rv-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '4px 0 8px', borderBottom: '1px solid var(--rv-border-subtle)', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Operational Modules
              </span>
            </div>
            <button
              className={`rv-sidebar__link ${activeTab === 'dashboard' ? 'rv-sidebar__link--active' : ''}`}
              onClick={() => handleSelect('dashboard')}
            >
              <span>Dashboard</span>
            </button>
            <button
              className={`rv-sidebar__link ${activeTab === 'leads' ? 'rv-sidebar__link--active' : ''}`}
              onClick={() => handleSelect('leads')}
            >
              <span>Leads</span>
            </button>
            <button
              className={`rv-sidebar__link ${activeTab === 'jobs' ? 'rv-sidebar__link--active' : ''}`}
              onClick={() => handleSelect('jobs')}
            >
              <span>Jobs</span>
            </button>
            <button
              className={`rv-sidebar__link ${activeTab === 'payments' ? 'rv-sidebar__link--active' : ''}`}
              onClick={() => handleSelect('payments')}
            >
              <span>Payments</span>
            </button>
            <button
              className={`rv-sidebar__link ${activeTab === 'customers' ? 'rv-sidebar__link--active' : ''}`}
              onClick={() => handleSelect('customers')}
            >
              <span>Customers</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
