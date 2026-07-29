import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ApiService, DEV_WORKSPACE_ID } from '../services/api';

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
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
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

  const signIn = async (email: string, password?: string) => {
    if (isSupabaseConfigured && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      // onAuthStateChange will call fetchUserProfile — don't create a fake profile here
      setIsAuthModalOpen(false);
      return { error: null };
    }

    // Dev-only fallback: Supabase not configured
    const profile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: email.includes('admin') ? 'admin' : email.includes('account') ? 'accounts' : 'operations',
      workspaceId: '00000000-0000-0000-0000-000000000001',
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
        signIn,
        signUp,
        signOut,
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
