'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { extractOnlyFirstName } from '@/lib/adTime';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role?: 'admin' | 'anunciante';
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; isAdmin?: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUserFromData: (user: AuthUser) => void;
  setAdminAuthenticated: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  setUserFromData: () => {},
  setAdminAuthenticated: () => {}
});

const LOCAL_STORAGE_KEY = 'chamba_auth_user';
const ADMIN_STORAGE_KEY = 'chamba_admin_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Verificar si hay sesión de Admin activa
        let isCurrentlyAdmin = false;
        try {
          const sessionAdmin = sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
          const localAdmin = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
          isCurrentlyAdmin = sessionAdmin || localAdmin;
          if (isCurrentlyAdmin) {
            setIsAdmin(true);
          }
        } catch (e) {}

        // 2. Verificar si hay sesión activa en Supabase
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const rawFirstName = meta.first_name || meta.full_name || session.user.email?.split('@')[0] || 'Usuario';
            const firstName = extractOnlyFirstName(rawFirstName, session.user.email);
            const lastName = meta.last_name || '';
            const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              firstName,
              lastName,
              fullName,
              role: isCurrentlyAdmin ? 'admin' : 'anunciante'
            };
            setUser(authUser);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
            setIsLoading(false);
            return;
          }
        }

        // 3. Fallback a sesión almacenada en localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.email || parsed.id)) {
              setUser(parsed);
              if (parsed.role === 'admin' || isCurrentlyAdmin) {
                setIsAdmin(true);
              }
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

    // 4. Listener en tiempo real de cambios de autenticación en Supabase
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {};
          const rawFirstName = meta.first_name || meta.full_name || session.user.email?.split('@')[0] || 'Usuario';
          const firstName = extractOnlyFirstName(rawFirstName, session.user.email);
          const lastName = meta.last_name || '';
          const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            firstName,
            lastName,
            fullName,
            role: 'anunciante'
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          try {
            sessionStorage.removeItem(ADMIN_STORAGE_KEY);
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch (e) {}
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanInput = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      // 1. IDENTIFICAR SI ES EL ADMINISTRADOR
      // Admite: "admin123", "admin", "admin@chambaaltoque.pe" con password "admin123"
      const isAdminLogin = 
        (cleanInput === 'admin123' || cleanInput === 'admin' || cleanInput === 'admin@chambaaltoque.pe') && 
        cleanPass === 'admin123';

      if (isAdminLogin) {
        const adminUser: AuthUser = {
          id: 'usr-admin',
          email: 'admin@chambaaltoque.pe',
          firstName: 'Admin',
          lastName: 'Sistema',
          fullName: 'Administrador Chamba Al Toque',
          role: 'admin'
        };
        setUser(adminUser);
        setIsAdmin(true);
        try {
          sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminUser));
        } catch (e) {}
        setIsLoading(false);
        return { success: true, isAdmin: true };
      }

      // 2. Autenticación de Anunciante regular en Supabase
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: pass
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message || 'Credenciales inválidas.' };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const rawFirstName = meta.first_name || meta.full_name || cleanInput.split('@')[0];
          const firstName = extractOnlyFirstName(rawFirstName, cleanInput);
          const lastName = meta.last_name || '';
          const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

          const authUser: AuthUser = {
            id: data.user.id,
            email: cleanInput,
            firstName,
            lastName,
            fullName,
            role: 'anunciante'
          };
          setUser(authUser);
          setIsAdmin(false);
          try {
            sessionStorage.removeItem(ADMIN_STORAGE_KEY);
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
          } catch (e) {}
          setIsLoading(false);
          return { success: true, isAdmin: false };
        }
      }

      // 3. Autenticación de Anunciante regular en Edge Config / Local Storage
      const firstName = extractOnlyFirstName(cleanInput.split('@')[0], cleanInput);
      const regularUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: cleanInput,
        firstName,
        lastName: '',
        fullName: firstName,
        role: 'anunciante'
      };
      setUser(regularUser);
      setIsAdmin(false);
      try {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(regularUser));
      } catch (e) {}
      setIsLoading(false);
      return { success: true, isAdmin: false };
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
      setIsAdmin(false);
      try {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {}
      setIsLoading(false);
    }
  };

  const setUserFromData = (userData: AuthUser) => {
    const cleanUser: AuthUser = {
      ...userData,
      firstName: extractOnlyFirstName(userData.firstName, userData.email)
    };
    setUser(cleanUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanUser));
  };

  const setAdminAuthenticated = (val: boolean) => {
    setIsAdmin(val);
    try {
      if (val) {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout, setUserFromData, setAdminAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
