import React from 'react';
import { Button } from './Button';

interface AppLoadingShellProps {
  errorMsg?: string | null;
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

export const AppLoadingShell: React.FC<AppLoadingShellProps> = ({
  errorMsg,
  onRetry,
  onContinueOffline,
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0d10',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
          }}
        >
          R
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.05em', color: '#f8fafc' }}>
            RIVET
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Operations Control Room • Janai Central
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}
      >
        {errorMsg ? (
          /* Recoverable Error State */
          <div>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
              Control Room Bootstrap Warning
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              {errorMsg}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onRetry && (
                <Button variant="primary" size="md" onClick={onRetry} style={{ width: '100%' }}>
                  🔄 Retry Connection
                </Button>
              )}
              {onContinueOffline && (
                <Button variant="secondary" size="md" onClick={onContinueOffline} style={{ width: '100%' }}>
                  ⚡ Continue with Current Session
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Dark Themed Loading Spinner & Pulse */
          <div>
            <div
              style={{
                width: '40px',
                height: '40px',
                margin: '0 auto 16px',
                border: '3px solid #30363d',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'rv-spin 0.8s linear infinite',
              }}
            />
            <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>
              Initializing Control Room Session
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Resolving workspace membership & operational telemetry...
            </p>
          </div>
        )}
      </div>

      {/* Inline Keyframe Animation */}
      <style>{`
        @keyframes rv-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
