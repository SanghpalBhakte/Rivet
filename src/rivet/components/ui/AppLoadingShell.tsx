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
        backgroundColor: '#0d0f12',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'rgba(94, 234, 212, 0.1)',
            border: '1px solid rgba(94, 234, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '15px',
            color: '#5eead4',
          }}
        >
          ⚡
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.08em', color: '#f1f5f9' }}>
            RIVET
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Operations Control Room
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#14171d',
          border: '1px solid #1c212b',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          textAlign: 'center',
        }}
      >
        {errorMsg ? (
          /* Recoverable Error State */
          <div>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
              Connection Interrupted
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
              {errorMsg}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                width: '32px',
                height: '32px',
                margin: '0 auto 16px',
                border: '2.5px solid #1c212b',
                borderTopColor: '#5eead4',
                borderRadius: '50%',
                animation: 'rv-spin 0.8s linear infinite',
              }}
            />
            <h2 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 600, color: '#f1f5f9' }}>
              Initializing Control Room
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Restoring workspace membership & operational telemetry...
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
