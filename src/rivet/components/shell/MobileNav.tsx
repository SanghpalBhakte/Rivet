import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="rv-mobile-drawer" role="dialog" aria-label="Mobile Navigation Menu">
          <div style={{ padding: '8px 0', borderBottom: '1px solid var(--rv-border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)', textTransform: 'uppercase' }}>
              Active Module
            </span>
          </div>
          <button className="rv-sidebar__link rv-sidebar__link--active">
            <span>Dashboard</span>
            <span className="rv-num">Live</span>
          </button>
          <button className="rv-sidebar__link rv-sidebar__link--disabled" disabled>
            <span>Leads</span>
            <span className="rv-sidebar__badge-soon">Phase 2</span>
          </button>
          <button className="rv-sidebar__link rv-sidebar__link--disabled" disabled>
            <span>Customers</span>
            <span className="rv-sidebar__badge-soon">Soon</span>
          </button>
          <button className="rv-sidebar__link rv-sidebar__link--disabled" disabled>
            <span>Jobs</span>
            <span className="rv-sidebar__badge-soon">Soon</span>
          </button>
          <button className="rv-sidebar__link rv-sidebar__link--disabled" disabled>
            <span>Payments</span>
            <span className="rv-sidebar__badge-soon">Soon</span>
          </button>
        </div>
      )}
    </>
  );
};
