import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getUserProfile,
  UserProfile,
  AuthError,
  resetPassword as supabaseResetPassword,
} from '../lib/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  // Acciones de autenticacion
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;

  // Utilidades
  refreshUserProfile: () => Promise<void>;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Cargar perfil de usuario extendido
  const loadUserProfile = useCallback(async () => {
    try {
      const { profile } = await getUserProfile();
      setState(prev => ({ ...prev, userProfile: profile }));
    } catch (error) {
      console.error('Error al cargar perfil de usuario:', error);
    }
  }, []);

  // Refrescar perfil de usuario
  const refreshUserProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  // Inicializar autenticacion y escuchar cambios
  useEffect(() => {
    let mounted = true;

    // Obtener sesion inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            setState(prev => ({
              ...prev,
              user: session.user,
              session: session,
              isAuthenticated: true,
              isLoading: false,
            }));
            // Cargar perfil extendido
            loadUserProfile();
          } else {
            setState(prev => ({
              ...prev,
              user: null,
              session: null,
              userProfile: null,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticacion:', error);
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    initializeAuth();

    // Escuchar cambios en la autenticacion
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (mounted) {
          if (session?.user) {
            setState(prev => ({
              ...prev,
              user: session.user,
              session: session,
              isAuthenticated: true,
              isLoading: false,
            }));

            // Cargar perfil extendido cuando el usuario inicia sesion
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              loadUserProfile();
            }
          } else {
            setState({
              user: null,
              session: null,
              userProfile: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { user, session, error } = await supabaseSignIn(email, password);

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { error };
      }

      if (user && session) {
        setState(prev => ({
          ...prev,
          user,
          session,
          isAuthenticated: true,
          isLoading: false,
        }));
        // El perfil se cargara via onAuthStateChange
      }

      return { error: null };
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { error: { message: e.message || 'Error al iniciar sesion' } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { user, error } = await supabaseSignUp(email, password, fullName);

      setState(prev => ({ ...prev, isLoading: false }));

      if (error) {
        return { error, needsConfirmation: false };
      }

      // Si el usuario se creo pero no tiene sesion, necesita confirmacion de email
      const needsConfirmation = user && !user.email_confirmed_at;

      return { error: null, needsConfirmation: !!needsConfirmation };
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        error: { message: e.message || 'Error al registrar usuario' },
        needsConfirmation: false
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await supabaseSignOut();
      setState({
        user: null,
        session: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabaseResetPassword(email);
      return { error };
    } catch (e: any) {
      return { error: { message: e.message || 'Error al enviar email de recuperacion' } };
    }
  }, []);

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// ============================================================================
// COMPONENTE PROTECTOR DE RUTAS
// ============================================================================

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
};

export default AuthContext;
