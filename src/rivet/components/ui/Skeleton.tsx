import React from 'react';

export const SkeletonRow: React.FC = () => {
  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--rv-border-subtle)',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="rv-skeleton" style={{ width: '60px', height: '18px' }} />
          <div className="rv-skeleton" style={{ width: '120px', height: '16px' }} />
        </div>
        <div className="rv-skeleton" style={{ width: '80%', height: '14px' }} />
        <div className="rv-skeleton" style={{ width: '40%', height: '12px' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="rv-skeleton" style={{ width: '70px', height: '14px' }} />
        <div className="rv-skeleton" style={{ width: '90px', height: '28px', borderRadius: '6px' }} />
      </div>
    </div>
  );
};

export const SkeletonMetric: React.FC = () => {
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px dashed var(--rv-border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div className="rv-skeleton" style={{ width: '90px', height: '14px' }} />
        <div className="rv-skeleton" style={{ width: '40px', height: '16px' }} />
      </div>
      <div className="rv-skeleton" style={{ width: '70px', height: '12px' }} />
    </div>
  );
};
