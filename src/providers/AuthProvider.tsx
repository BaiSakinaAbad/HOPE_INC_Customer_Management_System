import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';
const BLOCKED_USER_KEY = 'blocked-user-email';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  recordstatus: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  recordstatus: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [recordstatus, setRecordstatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchUserRole = async (userId: string, userEmail?: string) => {
    try {
      // Step 1: Primary lookup by UUID
      let roleValue: string | null = null;
      let statusValue: string | null = null;
      let blocked = false;

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
        blocked = byId.record_status === 'BLOCKED';
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
          blocked = byEmail.record_status === 'BLOCKED';
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

      if (blocked) {
        window.sessionStorage.setItem(BLOCKED_USER_KEY, userEmail || '');
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[AuthProvider] unexpected error in fetchUserRole:', err);
      if (!isMounted.current) return;
      setRole(null);
      setRecordstatus(null);
    } finally {
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
    <AuthContext.Provider value={{ session, user, role, recordstatus, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { BLOCKED_USER_KEY };
