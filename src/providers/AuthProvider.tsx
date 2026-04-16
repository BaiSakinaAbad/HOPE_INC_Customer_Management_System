import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees') 
        .select('role') 
        .eq('user_id', userId)
        .single();

      //console.log("RAW SUPABASE DATA:", data); debugging
      //console.log("SUPABASE ERROR:", error); debugging

      if (error) throw error;
      setRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    }
  };

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null); // Clear role on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
