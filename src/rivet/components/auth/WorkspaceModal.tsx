import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { getRoleBadgeLabel } from '../../utils/permissions';
import { Button } from '../ui/Button';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { user, joinWorkspace, switchRole } = useAuth();
  const [targetWorkspaceId, setTargetWorkspaceId] = useState('');
  const [joinRole, setJoinRole] = useState<UserRole>('operations');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyWorkspaceId = () => {
    navigator.clipboard.writeText(user.workspaceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await joinWorkspace(targetWorkspaceId.trim(), joinRole);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      setTargetWorkspaceId('');
      onClose();
    }
  };

  return (
    <div className="rv-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ws-modal-title">
      <div className="rv-modal-card" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 id="ws-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)' }}>
              Workspace Onboarding & Active Role
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--rv-text-muted)' }}>
              Rivet CRM • Workspace membership & access control settings
            </p>
          </div>
          <button className="rv-search-clear" onClick={onClose} title="Close modal">✕</button>
        </div>

        {errorMsg && (
          <div className="rv-error-banner" style={{ marginBottom: '12px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Current Active Workspace & Role Info */}
        <div style={{ background: 'var(--rv-bg-surface-elevated)', border: '1px solid var(--rv-border-default)', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Active Membership Context
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
                {user.fullName} ({user.email})
              </div>
              <div style={{ fontSize: '11px', color: 'var(--rv-text-secondary)' }}>
                Active Role: <strong style={{ color: 'var(--rv-status-job-text)' }}>{getRoleBadgeLabel(user.role)}</strong>
              </div>
            </div>
            <select
              value={user.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'var(--rv-bg-input)',
                color: 'var(--rv-text-primary)',
                border: '1px solid var(--rv-border-default)',
              }}
              title="Test role switcher"
            >
              <option value="admin">Admin</option>
              <option value="operations">Operations</option>
              <option value="accounts">Accounts</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
            Workspace ID (Share with teammates):
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              className="rv-search-input"
              style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }}
              value={user.workspaceId}
            />
            <Button variant="secondary" size="sm" onClick={handleCopyWorkspaceId}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>

        {/* Join Existing Workspace Form */}
        <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
            Join an Existing Workspace
          </h3>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
              Target Workspace ID *
            </label>
            <input
              type="text"
              className="rv-search-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="Paste 36-character Workspace UUID..."
              value={targetWorkspaceId}
              onChange={(e) => setTargetWorkspaceId(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
              Requested Member Role
            </label>
            <select
              value={joinRole}
              onChange={(e) => setJoinRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                background: 'var(--rv-bg-input)',
                color: 'var(--rv-text-primary)',
                border: '1px solid var(--rv-border-default)',
                fontSize: '12px',
              }}
            >
              <option value="operations">Operations — Handle dispatches & callbacks</option>
              <option value="accounts">Accounts — Process payments & billing</option>
              <option value="viewer">Viewer — Read-only auditing</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !targetWorkspaceId.trim()}>
              {submitting ? 'Joining Workspace...' : 'Join Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
