import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserPermissions, getDefaultPermissions, resetPermissionsToDefaults } from '../services/permissionService';

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
  refreshPermissions: async () => { },
  signOut: async () => { },
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
  // Tracks the user ID that has been fully initialised (role + permissions loaded).
  // Component-level ref so it survives React strict-mode double-invocations.
  const loadedUserIdRef = useRef<string>('');

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
    if (data && Object.keys(data).length > 0) {
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

  const fetchUserRole = async (userId: string, userEmail?: string, showLoading = true) => {
    // Prevent duplicate concurrent calls from getSession + onAuthStateChange race
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    if (showLoading) setLoading(true);

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
        loadedUserIdRef.current = session.user.id;
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login / logout).
    //
    // We explicitly ignore events that Supabase fires silently when the
    // window regains focus so the UI never flashes a loading screen:
    //   • TOKEN_REFRESHED  — silent JWT refresh on focus / timer
    //   • INITIAL_SESSION  — already handled by getSession() above
    //   • SIGNED_IN with the same user ID — can accompany TOKEN_REFRESHED
    //
    // A full role-fetch only runs when the user ID genuinely changes
    // (different account) or when the session is cleared (sign-out).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted.current) return;

      // Always keep the raw token up-to-date (never triggers loading)
      setSession(session);
      setUser(session?.user ?? null);

      // Signed out — clear state
      if (!session?.user) {
        loadedUserIdRef.current = '';
        setRole(null);
        setRecordstatus(null);
        setPermissions({});
        setLoading(false);
        return;
      }

      const incomingId = session.user.id;

      // Skip if it's a background/silent event or the same user is already loaded
      if (
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'  ||
        incomingId === loadedUserIdRef.current
      ) {
        return;
      }

      // Genuinely new user signing in — run full initialisation
      loadedUserIdRef.current = incomingId;
      fetchUserRole(session.user.id, session.user.email, true);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Realtime subscription: detect role changes made directly in the DB.
   * When the role column changes, reset permissions to the new role's defaults
   * and reload them into state.
   */
  useEffect(() => {
    const currentUser = user ?? session?.user;
    if (!currentUser) return;

    const channel = supabase
      .channel(`app_user_role_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_user',
          filter: `id=eq.${currentUser.id}`,
        },
        async (payload) => {
          if (!isMounted.current) return;
          const newRole = (payload.new as { role?: string }).role;
          const oldRole = (payload.old as { role?: string }).role;
          const newStatus = (payload.new as { record_status?: string }).record_status;

          // Update record status if changed
          if (newStatus !== undefined) {
            setRecordstatus(newStatus);
          }

          // If role didn't change, ignore
          if (!newRole || newRole.toLowerCase() === oldRole?.toLowerCase()) return;

          const normalizedNew = newRole.toLowerCase();
          console.log(`[AuthProvider] Realtime role change detected: ${oldRole} → ${newRole}`);
          setRole(normalizedNew);

          // Reset permissions in DB to new role's defaults, then reload
          const { error: resetErr } = await resetPermissionsToDefaults(currentUser.id, normalizedNew);
          if (resetErr) {
            console.error('[AuthProvider] Failed to reset permissions on role change:', resetErr);
          }

          await loadPermissions(currentUser.id, normalizedNew);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, session, loadPermissions]);

  const signOut = async () => {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    // Clear navigation state so next login starts fresh (dashboard for superadmin, customers for others)
    window.sessionStorage.removeItem('dashboard-nav-state');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, recordstatus, loading, permissions, refreshPermissions, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
