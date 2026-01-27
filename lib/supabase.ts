import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

/**
 * Configuracion de Supabase con Autenticacion
 * ============================================
 * Este cliente maneja tanto la conexion a la base de datos como la autenticacion.
 *
 * Variables de entorno requeridas:
 * - VITE_SUPABASE_URL: URL de tu proyecto Supabase
 * - VITE_SUPABASE_ANON_KEY: Clave publica (anon key) de Supabase
 *
 * IMPORTANTE: Nunca expongas la SERVICE_ROLE_KEY en el frontend.
 * Esa clave solo debe usarse en el backend/servidor.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificamos si las credenciales son validas
const isValidConfig = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey;

// Tipo para el perfil de usuario extendido
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'basic' | 'premium' | 'lifetime';
  is_active: boolean;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'expired';
  subscription_expires_at: string | null;
  max_profiles: number;
  max_subjects_per_profile: number;
  preferences: Record<string, any>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para errores de autenticacion
export interface AuthError {
  message: string;
  status?: number;
}

// Cliente de Supabase real o mock
export const supabase: SupabaseClient = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Almacenar sesion en localStorage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : new Proxy({} as SupabaseClient, {
      get: (target, prop) => {
        if (prop === 'from') {
          return () => {
            const chain: any = {
              insert: () => Promise.resolve({ data: null, error: null }),
              select: () => chain,
              update: () => Promise.resolve({ data: null, error: null }),
              delete: () => chain,
              eq: () => chain,
              order: () => chain,
              limit: () => chain,
              single: () => Promise.resolve({ data: null, error: null }),
              then: (onfulfilled: any) => Promise.resolve({ data: null, error: null }).then(onfulfilled),
            };
            return chain;
          };
        }
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: (callback: any) => {
              // Simular que no hay sesion
              callback('SIGNED_OUT', null);
              return { data: { subscription: { unsubscribe: () => {} } } };
            },
            signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase no configurado. Modo offline.' } }),
            signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase no configurado. Modo offline.' } }),
            signOut: () => Promise.resolve({ error: null }),
            resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.' } }),
            updateUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase no configurado.' } }),
          };
        }
        if (prop === 'rpc') {
          return () => Promise.resolve({ data: null, error: null });
        }
        return () => {};
      }
    });

if (!isValidConfig) {
  console.warn(
    "Supabase no esta configurado. La app funcionara en modo offline (Mock).\n" +
    "Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para conectar la base de datos."
  );
}

// ============================================================================
// FUNCIONES DE AUTENTICACION
// ============================================================================

/**
 * Registrar un nuevo usuario
 * @param email - Correo electronico del usuario
 * @param password - Contrasena (minimo 6 caracteres)
 * @param fullName - Nombre completo del usuario (opcional)
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, error: { message: translateAuthError(error.message), status: error.status } };
    }

    return { user: data.user, error: null };
  } catch (e: any) {
    return { user: null, error: { message: e.message || 'Error al registrar usuario' } };
  }
}

/**
 * Iniciar sesion con email y contrasena
 * @param email - Correo electronico
 * @param password - Contrasena
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: { message: translateAuthError(error.message), status: error.status } };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (e: any) {
    return { user: null, session: null, error: { message: e.message || 'Error al iniciar sesion' } };
  }
}

/**
 * Cerrar sesion del usuario actual
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (e: any) {
    return { error: { message: e.message || 'Error al cerrar sesion' } };
  }
}

/**
 * Obtener la sesion actual del usuario
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { session: null, error: { message: error.message } };
    }
    return { session: data.session, error: null };
  } catch (e: any) {
    return { session: null, error: { message: e.message || 'Error al obtener sesion' } };
  }
}

/**
 * Obtener el usuario actual
 */
export async function getUser(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return { user: null, error: { message: error.message } };
    }
    return { user: data.user, error: null };
  } catch (e: any) {
    return { user: null, error: { message: e.message || 'Error al obtener usuario' } };
  }
}

/**
 * Enviar email para restablecer contrasena
 * @param email - Correo electronico del usuario
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      return { error: { message: translateAuthError(error.message) } };
    }
    return { error: null };
  } catch (e: any) {
    return { error: { message: e.message || 'Error al enviar email de recuperacion' } };
  }
}

/**
 * Actualizar contrasena del usuario actual
 * @param newPassword - Nueva contrasena
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return { error: { message: translateAuthError(error.message) } };
    }
    return { error: null };
  } catch (e: any) {
    return { error: { message: e.message || 'Error al actualizar contrasena' } };
  }
}

// ============================================================================
// FUNCIONES DE PERFIL DE USUARIO
// ============================================================================

/**
 * Obtener el perfil extendido del usuario actual
 */
export async function getUserProfile(): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { profile: null, error: { message: 'Usuario no autenticado' } };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      return { profile: null, error: { message: error.message } };
    }

    return { profile: data as UserProfile, error: null };
  } catch (e: any) {
    return { profile: null, error: { message: e.message || 'Error al obtener perfil' } };
  }
}

/**
 * Actualizar el perfil del usuario actual
 * @param updates - Campos a actualizar
 */
export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'preferences'>>
): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { profile: null, error: { message: 'Usuario no autenticado' } };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userData.user.id)
      .select()
      .single();

    if (error) {
      return { profile: null, error: { message: error.message } };
    }

    return { profile: data as UserProfile, error: null };
  } catch (e: any) {
    return { profile: null, error: { message: e.message || 'Error al actualizar perfil' } };
  }
}

/**
 * Verificar si el usuario puede crear mas perfiles segun su plan
 */
export async function canCreateProfile(): Promise<{ canCreate: boolean; message: string }> {
  try {
    const { profile, error } = await getUserProfile();
    if (error || !profile) {
      return { canCreate: false, message: 'No se pudo verificar el perfil de usuario' };
    }

    if (!profile.is_active) {
      return { canCreate: false, message: 'Tu cuenta esta desactivada. Contacta a soporte.' };
    }

    // Contar perfiles existentes
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { canCreate: false, message: 'Usuario no autenticado' };
    }

    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user.id);

    if (countError) {
      return { canCreate: false, message: 'Error al verificar limites' };
    }

    const currentCount = count || 0;

    if (currentCount >= profile.max_profiles) {
      return {
        canCreate: false,
        message: `Has alcanzado el limite de ${profile.max_profiles} perfil(es) para tu plan "${profile.plan}". Actualiza tu plan para crear mas.`
      };
    }

    return { canCreate: true, message: 'OK' };
  } catch (e: any) {
    return { canCreate: false, message: e.message || 'Error desconocido' };
  }
}

/**
 * Verificar si el usuario puede crear mas materias en un perfil
 * @param profileId - ID del perfil de la app
 */
export async function canCreateSubject(profileId: string): Promise<{ canCreate: boolean; message: string }> {
  try {
    const { profile, error } = await getUserProfile();
    if (error || !profile) {
      return { canCreate: false, message: 'No se pudo verificar el perfil de usuario' };
    }

    if (!profile.is_active) {
      return { canCreate: false, message: 'Tu cuenta esta desactivada. Contacta a soporte.' };
    }

    // Contar materias en este perfil
    const { count, error: countError } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (countError) {
      return { canCreate: false, message: 'Error al verificar limites' };
    }

    const currentCount = count || 0;

    if (currentCount >= profile.max_subjects_per_profile) {
      return {
        canCreate: false,
        message: `Has alcanzado el limite de ${profile.max_subjects_per_profile} materia(s) por perfil para tu plan "${profile.plan}". Actualiza tu plan para crear mas.`
      };
    }

    return { canCreate: true, message: 'OK' };
  } catch (e: any) {
    return { canCreate: false, message: e.message || 'Error desconocido' };
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Traducir mensajes de error de autenticacion al espanol
 */
function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Credenciales incorrectas. Verifica tu email y contrasena.',
    'Email not confirmed': 'Por favor, confirma tu email antes de iniciar sesion.',
    'User already registered': 'Este correo ya esta registrado. Intenta iniciar sesion.',
    'Password should be at least 6 characters': 'La contrasena debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'El formato del email no es valido.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
    'For security purposes, you can only request this once every 60 seconds': 'Por seguridad, solo puedes solicitar esto una vez cada 60 segundos.',
    'New password should be different from the old password': 'La nueva contrasena debe ser diferente a la anterior.',
    'Auth session missing!': 'Sesion expirada. Por favor, inicia sesion nuevamente.',
  };

  return translations[message] || message;
}

/**
 * Verificar si Supabase esta configurado correctamente
 */
export function isSupabaseConfigured(): boolean {
  return isValidConfig;
}

/**
 * Obtener el ID del usuario actual (util para operaciones rapidas)
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
}
