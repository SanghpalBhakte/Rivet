import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) setErrorMsg(res.error);
      } else {
        const res = await signUp(email, password, fullName);
        if (res.error) setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rv-lead-drawer-overlay" onClick={closeAuthModal} style={{ zIndex: 1000 }}>
      <div
        className="rv-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '380px',
          maxWidth: '90vw',
          margin: '100px auto',
          background: 'var(--rv-bg-surface-elevated)',
          border: '1px solid var(--rv-border-strong)',
          boxShadow: 'var(--rv-shadow-lg)',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--rv-text-primary)' }}>
              {mode === 'signin' ? 'Sign In to Rivet CRM' : 'Create User Account'}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--rv-text-muted)' }}>
              {isConfigured ? 'Connected to Supabase PostgreSQL' : 'Local Standalone Mode Active'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={closeAuthModal}>
            ✕
          </Button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--rv-status-overdue-bg)', border: '1px solid var(--rv-status-overdue-border)', color: 'var(--rv-status-overdue-text)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', display: 'block', marginBottom: '4px' }}>
                FULL NAME
              </label>
              <input
                type="text"
                className="rv-lead-note-input"
                placeholder="e.g. Suresh M."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', display: 'block', marginBottom: '4px' }}>
              WORK EMAIL
            </label>
            <input
              type="email"
              className="rv-lead-note-input"
              placeholder="e.g. ops.admin@rivet.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', display: 'block', marginBottom: '4px' }}>
              PASSWORD {isConfigured ? '' : '(Optional in Dev Mode)'}
            </label>
            <input
              type="password"
              className="rv-lead-note-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isConfigured}
            />
          </div>

          <Button type="submit" variant="primary" size="md" disabled={submitting} style={{ marginTop: '8px', width: '100%' }}>
            {submitting ? 'Authenticating...' : mode === 'signin' ? '🔑 Sign In to Workspace' : '⚡ Create Account'}
          </Button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', fontSize: '11px' }}>
            {mode === 'signin' ? (
              <button type="button" onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--rv-brand)', cursor: 'pointer' }}>
                Need a new user account? Sign Up
              </button>
            ) : (
              <button type="button" onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: 'var(--rv-brand)', cursor: 'pointer' }}>
                Already have an account? Sign In
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
