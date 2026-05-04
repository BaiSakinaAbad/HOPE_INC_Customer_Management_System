import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserPermissions, getDefaultPermissions } from '../services/permissionService';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  recordstatus: string | null;
  loading: boolean;
  /** permission_id → is_granted map from the user_permission table. */
  permissions: Record<string, boolean>;
  /** Re-fetch permissions from DB (e.g. after a role change). */
  refreshPermissions: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  recordstatus: null,
  loading: true,
  permissions: {},
  refreshPermissions: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [recordstatus, setRecordstatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const isMounted = useRef(true);
  // Guard against concurrent fetchUserRole calls (getSession + onAuthStateChange race)
  const fetchInFlight = useRef(false);

  /**
   * Load permissions: start with role defaults, then overlay any DB results.
   * This handles partial RLS reads — missing rows keep their role defaults.
   */
  const loadPermissions = useCallback(async (userId: string, roleHint?: string | null) => {
    // Always start with the role's default permissions as the base
    const defaults = getDefaultPermissions(roleHint ?? 'user');
    const merged: Record<string, boolean> = { ...defaults };

    const { data } = await fetchUserPermissions(userId);
    if (!isMounted.current) return;

    // Overlay DB results on top of defaults (DB wins where present)
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        merged[key] = value;
      }
    }

    setPermissions(merged);
  }, []);

  /** Public method to re-fetch current user's permissions. */
  const refreshPermissions = useCallback(async () => {
    const currentUser = user ?? session?.user;
    if (currentUser) {
      await loadPermissions(currentUser.id, role);
    }
  }, [user, session, role, loadPermissions]);

  const fetchUserRole = async (userId: string, userEmail?: string) => {
    // Prevent duplicate concurrent calls from getSession + onAuthStateChange race
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;

    try {
      // Step 1: Primary lookup by UUID
      let roleValue: string | null = null;
      let statusValue: string | null = null;
      const { data: byId, error: errById } = await supabase
        .from('app_user')
        .select('role, record_status')
        .eq('id', userId)
        .maybeSingle();

      if (errById) {
        console.error('[AuthProvider] id-lookup error:', errById.code, errById.message);
      } else if (byId) {
        roleValue = typeof byId.role === 'string' ? byId.role.toLowerCase() : null;
        statusValue = byId.record_status || null;
      }

      // Step 2: Fallback — look up by email if id lookup returned nothing
      if (!roleValue && !errById && userEmail) {
        const { data: byEmail, error: errByEmail } = await supabase
          .from('app_user')
          .select('role, record_status')
          .eq('email', userEmail)
          .maybeSingle();

        if (errByEmail) {
          console.error('[AuthProvider] email-lookup error:', errByEmail.code, errByEmail.message);
        } else if (byEmail) {
          roleValue = typeof byEmail.role === 'string' ? byEmail.role.toLowerCase() : null;
          statusValue = byEmail.record_status || null;
        }
      }

      // Step 3: Final fallback — call the get_current_user_role() RPC
      if (!roleValue) {
        const { data: rpcRole, error: errRpc } = await supabase.rpc('get_current_user_role');
        if (errRpc) {
          console.error('[AuthProvider] rpc fallback error:', errRpc.code, errRpc.message);
        } else if (typeof rpcRole === 'string') {
          roleValue = rpcRole.toLowerCase();
        }
      }

      if (!isMounted.current) return;

      setRole(roleValue);
      setRecordstatus(statusValue);

      // Load permissions after role is resolved
      await loadPermissions(userId, roleValue);
    } catch (err) {
      console.error('[AuthProvider] unexpected error in fetchUserRole:', err);
      if (!isMounted.current) return;
      setRole(null);
      setRecordstatus(null);
      setPermissions({});
    } finally {
      fetchInFlight.current = false;
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;

    // Use getSession() as single source of truth on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted.current) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted.current) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setRole(null);
        setRecordstatus(null);
        setPermissions({});
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, recordstatus, loading, permissions, refreshPermissions, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
