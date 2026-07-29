import React, { createContext, useContext, useState, useEffect } from 'react';
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
  isConfigured: boolean;
  can: (action: PermissionAction) => boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  joinWorkspace: (targetWorkspaceId: string, role?: UserRole) => Promise<{ error: string | null }>;
  switchRole: (role: UserRole) => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rv_active_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-admin-01',
      email: 'ops.admin@rivet.internal',
      fullName: 'Suresh M. (Ops Admin)',
      role: 'admin' as UserRole,
      workspaceId: DEV_WORKSPACE_ID,
    };
  });

  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        localStorage.removeItem('rv_active_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const resolvedWorkspaceId = data.workspace_id || DEV_WORKSPACE_ID;
        const profile: UserProfile = {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || 'Ops Staff',
          role: (data.role as UserRole) || 'operations',
          workspaceId: resolvedWorkspaceId,
        };
        setUser(profile);
        localStorage.setItem('rv_active_user', JSON.stringify(profile));

        // Idempotent: ensure workspace_members row exists for this session
        await ApiService.ensureWorkspaceMembership(userId, resolvedWorkspaceId, data.role || 'operations');
      }
    } catch {
      // Fallback — don't block auth on profile fetch failure
    }
  };

  const can = (action: PermissionAction): boolean => {
    return hasPermission(user?.role, action);
  };

  const signIn = async (email: string, password?: string) => {
    if (isSupabaseConfigured && password) {
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
    localStorage.setItem('rv_active_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
    return { error: null };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (isSupabaseConfigured && password) {
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
      localStorage.setItem('rv_active_user', JSON.stringify(updatedUser));
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join workspace';
      return { error: msg };
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('rv_active_user', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      await supabase.from('user_profiles').update({ role: newRole }).eq('id', user.id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
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
        isConfigured: isSupabaseConfigured,
        can,
        signIn,
        signUp,
        signOut,
        joinWorkspace,
        switchRole,
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

