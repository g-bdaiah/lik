import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type SystemUser } from '../data/mockData';

interface AuthContextType {
  loggedInUser: SystemUser | null;
  login: (user: SystemUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<SystemUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('system_users')
            .select(`
              *,
              roles:role_id (
                id,
                name,
                description,
                permissions
              )
            `)
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          if (!userError && userData) {
            const systemUser: SystemUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              roleId: userData.role_id,
              associatedId: userData.associated_id,
              associatedType: userData.associated_type,
              status: userData.status,
              lastLogin: userData.last_login || new Date().toISOString(),
              createdAt: userData.created_at,
            };
            setLoggedInUser(systemUser);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('system_users')
          .select(`
            *,
            roles:role_id (
              id,
              name,
              description,
              permissions
            )
          `)
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (!userError && userData) {
          const systemUser: SystemUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            roleId: userData.role_id,
            associatedId: userData.associated_id,
            associatedType: userData.associated_type,
            status: userData.status,
            lastLogin: new Date().toISOString(),
            createdAt: userData.created_at,
          };
          setLoggedInUser(systemUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setLoggedInUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (user: SystemUser) => {
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    setLoggedInUser(updatedUser);
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    setLoggedInUser(null);
  };

  const updateUser = (updates: Partial<SystemUser>) => {
    if (loggedInUser) {
      setLoggedInUser({
        ...loggedInUser,
        ...updates
      });
    }
  };

  const value = {
    loggedInUser,
    login,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};