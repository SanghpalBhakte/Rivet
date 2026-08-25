import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ApiService, DEV_WORKSPACE_ID } from '../services/api';
import { hasPermission, PermissionAction } from '../utils/permissions';

export type UserRole = 'admin' | 'operations' | 'accounts' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  workspaceId: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  bootstrapping: boolean;
  bootstrapError: string | null;
  isConfigured: boolean;
  can: (action: PermissionAction) => boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  joinWorkspace: (targetWorkspaceId: string, role?: UserRole) => Promise<{ error: string | null }>;
  switchRole: (role: UserRole) => Promise<void>;
  retryBootstrap: () => Promise<void>;
  dismissBootstrapError: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Persist a verified user profile to localStorage.
 * Never persists the hardcoded dev fallback user (id: 'usr-admin-01').
 */
const persistUser = (profile: UserProfile): void => {
  if (!profile?.id || profile.id === 'usr-admin-01') return;
  try {
    localStorage.setItem('rv_active_user', JSON.stringify(profile));
  } catch {
    // localStorage may be unavailable in sandboxed environments — fail silently
  }
};

/**
 * Safely read a stored user profile from localStorage.
 * Returns null if the stored value is the legacy dev fallback or malformed.
 */
const readStoredUser = (): UserProfile | null => {
  try {
    const saved = localStorage.getItem('rv_active_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved) as UserProfile;
    // Reject the legacy hardcoded dev user that should never have been persisted
    if (parsed?.id === 'usr-admin-01') {
      localStorage.removeItem('rv_active_user');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // FIX: Default is null, not a hardcoded fake admin.
  // readStoredUser() also rejects the legacy 'usr-admin-01' sentinel.
  const [user, setUser] = useState<UserProfile | null>(readStoredUser);

  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState<boolean>(isSupabaseConfigured);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        // FIX: Do NOT fall back to DEV_WORKSPACE_ID for production users.
        // A missing workspace_id means the user needs to create/join a workspace.
        // We set workspaceId to '' and let the app's auth gate show the workspace setup screen.
        const resolvedWorkspaceId = data.workspace_id || '';
        const profile: UserProfile = {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || 'Ops Staff',
          role: (data.role as UserRole) || 'operations',
          workspaceId: resolvedWorkspaceId,
        };
        setUser(profile);
        persistUser(profile);

        // Idempotent: ensure workspace_members row exists — only if workspace is real
        if (resolvedWorkspaceId) {
          await ApiService.ensureWorkspaceMembership(userId, resolvedWorkspaceId, data.role || 'operations');
        }
      } else {
        // Profile row missing: set a minimal authenticated but workspaceless state.
        // The app's auth gate will prompt workspace creation.
        const fallbackProfile: UserProfile = {
          id: userId,
          email,
          fullName: email.split('@')[0] || 'Ops Staff',
          role: 'operations',
          workspaceId: '', // FIX: empty string, not DEV_WORKSPACE_ID
        };
        setUser(fallbackProfile);
        // Do NOT persist a profile with no workspace — it will be re-resolved on next boot
      }
    } catch (err: unknown) {
      console.warn('[Rivet Auth] Profile resolution warning:', err);
    }
  };

  const initAuthSession = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setBootstrapping(false);
      setBootstrapError(null);
      return;
    }

    setBootstrapping(true);
    setBootstrapError(null);

    // Timeout safety race promise (6s)
    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 6000)
    );

    try {
      const getSessionPromise = supabase.auth.getSession();
      const result = await Promise.race([getSessionPromise, timeoutPromise]);

      if ('timeout' in result) {
        console.warn('[Rivet Auth] Session resolution timed out (6s)');
        setBootstrapError('Session resolution timed out. Please check your network connection.');
        setBootstrapping(false);
        return;
      }

      const session = result.data?.session;
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        // No active session — ensure user state is null (not a stale localStorage value)
        // unless the stored user was explicitly saved from a valid prior session
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication session check failed';
      setBootstrapError(msg);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    initAuthSession();

    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('rv_active_user');
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuthSession]);

  const can = (action: PermissionAction): boolean => {
    return hasPermission(user?.role, action);
  };

  const signIn = async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      setIsAuthModalOpen(false);
      return { error: null };
    }

    // Dev-only fallback: Supabase not configured
    const profile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: email.includes('admin') ? 'admin' : email.includes('account') ? 'accounts' : 'operations',
      workspaceId: DEV_WORKSPACE_ID,
    };
    setUser(profile);
    persistUser(profile);
    setIsAuthModalOpen(false);
    return { error: null };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (isSupabaseConfigured && supabase && password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
    }

    return signIn(email, password);
  };

  const joinWorkspace = async (targetWorkspaceId: string, role: UserRole = 'operations') => {
    if (!user) return { error: 'Must be logged in to join a workspace' };

    try {
      const res = await ApiService.joinWorkspace(user.id, targetWorkspaceId, role, user.fullName);
      const updatedUser: UserProfile = {
        ...user,
        workspaceId: res.workspaceId,
        role: res.role,
      };
      setUser(updatedUser);
      persistUser(updatedUser);
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join workspace';
      return { error: msg };
    }
  };

  const switchRole = async (newRole: UserRole) => {
    // FIX: Only admins may switch roles. Prevents client-side privilege escalation.
    if (!user || user.role !== 'admin') {
      console.warn('[Rivet Auth] switchRole rejected: caller is not admin');
      return;
    }
    const updated = { ...user, role: newRole };
    setUser(updated);
    persistUser(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('user_profiles').update({ role: newRole }).eq('id', user.id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('rv_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        bootstrapping,
        bootstrapError,
        isConfigured: isSupabaseConfigured,
        can,
        signIn,
        signUp,
        signOut,
        joinWorkspace,
        switchRole,
        retryBootstrap: initAuthSession,
        dismissBootstrapError: () => setBootstrapError(null),
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
