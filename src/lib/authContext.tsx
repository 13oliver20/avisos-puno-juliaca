'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUserFromData: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  setUserFromData: () => {}
});

const LOCAL_STORAGE_KEY = 'chamba_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Verificar si hay sesión activa en Supabase
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const firstName = meta.first_name || session.user.email?.split('@')[0] || 'Usuario';
            const lastName = meta.last_name || '';
            const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              firstName,
              lastName,
              fullName
            };
            setUser(authUser);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
            setIsLoading(false);
            return;
          }
        }

        // 2. Fallback a sesión almacenada en localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email) {
              setUser(parsed);
            }
          } catch (e) {
            console.error('Error parsing stored user session', e);
          }
        }
      } catch (err) {
        console.error('Error in initAuth:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // 3. Listener en tiempo real de cambios de autenticación en Supabase
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {};
          const firstName = meta.first_name || session.user.email?.split('@')[0] || 'Usuario';
          const lastName = meta.last_name || '';
          const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            firstName,
            lastName,
            fullName
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message || 'Credenciales inválidas.' };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const firstName = meta.first_name || cleanEmail.split('@')[0];
          const lastName = meta.last_name || '';
          const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

          const authUser: AuthUser = {
            id: data.user.id,
            email: cleanEmail,
            firstName,
            lastName,
            fullName
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // Si Supabase no está activo o como fallback demostrativo para desarrollo
      const fallbackUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        firstName: cleanEmail.split('@')[0],
        lastName: '',
        fullName: cleanEmail.split('@')[0]
      };
      setUser(fallbackUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Error inesperado al iniciar sesión.' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Error during supabase sign out', e);
    } finally {
      setUser(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsLoading(false);
    }
  };

  const setUserFromData = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUserFromData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
