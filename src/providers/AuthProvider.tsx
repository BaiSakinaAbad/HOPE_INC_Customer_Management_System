import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';
const BLOCKED_USER_KEY = 'blocked-user-email';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  recordstatus: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  recordstatus: null,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [recordstatus, setRecordstatus] = useState<string | null>(null);

  const fetchUserRole = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('employees') 
        .select('role, recordstatus') 
        .eq('user_id', userId)
        .single();

      //console.log("RAW SUPABASE DATA:", data); debugging
      //console.log("SUPABASE ERROR:", error); debugging

      if (error) throw error;
      setRole(data?.role || null);
      setRecordstatus(data?.recordstatus || null);

      // If user is blocked, sign them out immediately
      if (data?.recordstatus === 'BLOCKED') {
        window.sessionStorage.setItem(BLOCKED_USER_KEY, userEmail || '');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
      setRecordstatus(null);
    }
  };

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setRole(null);
        setRecordstatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, recordstatus, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { BLOCKED_USER_KEY };
