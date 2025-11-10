import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type SystemUser } from '../data/mockData';

interface AuthContextType {
  loggedInUser: SystemUser | null;
  login: (user: SystemUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<SystemUser>) => void;
  isLoading: boolean;
  error: string | null;
  retryAuth: () => void;
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

const CACHE_KEY = 'auth_user_cache';
const CACHE_EXPIRY = 5 * 60 * 1000;

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};

const getCachedUser = (): SystemUser | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { user, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return user;
      }
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (error) {
    console.error('Error reading cached user:', error);
  }
  return null;
};

const setCachedUser = (user: SystemUser | null) => {
  try {
    if (user) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ user, timestamp: Date.now() })
      );
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await withTimeout(sessionPromise, 5000);

      if (session?.user) {
        const userQueryPromise = supabase
          .from('system_users')
          .select('id, name, email, phone, role_id, associated_id, associated_type, status, last_login, created_at')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        const { data: userData, error: userError } = await withTimeout(userQueryPromise, 5000);

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
          setCachedUser(systemUser);
          setError(null);
        } else {
          setLoggedInUser(null);
          setCachedUser(null);
          if (userError) {
            setError('فشل في جلب بيانات المستخدم');
          }
        }
      } else {
        setLoggedInUser(null);
        setCachedUser(null);
      }
    } catch (error: any) {
      console.error('Error checking session:', error);
      const cachedUser = getCachedUser();

      if (error.message === 'Request timeout') {
        setError('انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setError('حدث خطأ في التحقق من الجلسة');
      }

      if (cachedUser) {
        setLoggedInUser(cachedUser);
      } else {
        setLoggedInUser(null);
        setCachedUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryAuth = () => {
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const cachedUser = getCachedUser();
    if (cachedUser) {
      setLoggedInUser(cachedUser);
      setIsLoading(false);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userQueryPromise = supabase
            .from('system_users')
            .select('id, name, email, phone, role_id, associated_id, associated_type, status, last_login, created_at')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          const { data: userData, error: userError } = await withTimeout(userQueryPromise, 5000);

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
            setCachedUser(systemUser);
          }
        } catch (error) {
          console.error('Error fetching user on auth state change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setLoggedInUser(null);
        setCachedUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [retryCount]);

  const login = (user: SystemUser) => {
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    setLoggedInUser(updatedUser);
    setCachedUser(updatedUser);
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
    setCachedUser(null);
  };

  const updateUser = (updates: Partial<SystemUser>) => {
    if (loggedInUser) {
      const updatedUser = {
        ...loggedInUser,
        ...updates
      };
      setLoggedInUser(updatedUser);
      setCachedUser(updatedUser);
    }
  };

  const value = {
    loggedInUser,
    login,
    logout,
    updateUser,
    isLoading,
    error,
    retryAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};