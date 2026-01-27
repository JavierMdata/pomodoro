import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthProps {
  onSuccess?: () => void;
  theme?: 'light' | 'dark';
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Auth: React.FC<AuthProps> = ({ onSuccess, theme = 'light' }) => {
  const { signIn, signUp, resetPassword, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones basicas
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electronico');
      return;
    }

    if (mode !== 'forgot-password' && !password) {
      setError('Por favor, ingresa tu contrasena');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('La contrasena debe tener al menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contrasenas no coinciden');
        return;
      }
    }

    try {
      if (mode === 'login') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          onSuccess?.();
        }
      } else if (mode === 'register') {
        const { error: signUpError, needsConfirmation } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError.message);
        } else if (needsConfirmation) {
          setSuccess('Cuenta creada. Por favor, revisa tu correo para confirmar tu cuenta.');
          setMode('login');
        } else {
          onSuccess?.();
        }
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError.message);
        } else {
          setSuccess('Te hemos enviado un correo con instrucciones para restablecer tu contrasena.');
          setMode('login');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Ocurrio un error. Intenta de nuevo.');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`w-full max-w-md mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">
          {mode === 'login' && 'Bienvenido de vuelta'}
          {mode === 'register' && 'Crear cuenta'}
          {mode === 'forgot-password' && 'Recuperar contrasena'}
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {mode === 'login' && 'Inicia sesion para continuar con tu estudio'}
          {mode === 'register' && 'Crea tu cuenta para empezar a usar PomoSmart'}
          {mode === 'forgot-password' && 'Te enviaremos un enlace para restablecer tu contrasena'}
        </p>
      </div>

      {/* Mensajes de error/exito */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Nombre (solo registro) */}
        {mode === 'register' && (
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nombre completo
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>
          </div>
        )}

        {/* Campo Email */}
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Correo electronico
          </label>
          <div className="relative">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
        </div>

        {/* Campo Contrasena */}
        {mode !== 'forgot-password' && (
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Contrasena
            </label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                required
                className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Confirmar Contrasena (solo registro) */}
        {mode === 'register' && (
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Confirmar contrasena
            </label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contrasena"
                required
                className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>
          </div>
        )}

        {/* Link Olvide contrasena (solo login) */}
        {mode === 'login' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode('forgot-password')}
              className={`text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Olvide mi contrasena
            </button>
          </div>
        )}

        {/* Boton Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Procesando...
            </>
          ) : (
            <>
              {mode === 'login' && 'Iniciar sesion'}
              {mode === 'register' && 'Crear cuenta'}
              {mode === 'forgot-password' && 'Enviar instrucciones'}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      {/* Links para cambiar de modo */}
      <div className="mt-8 text-center">
        {mode === 'login' && (
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            No tienes cuenta?{' '}
            <button
              onClick={() => switchMode('register')}
              className={`font-bold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Registrate aqui
            </button>
          </p>
        )}

        {mode === 'register' && (
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Ya tienes cuenta?{' '}
            <button
              onClick={() => switchMode('login')}
              className={`font-bold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Inicia sesion
            </button>
          </p>
        )}

        {mode === 'forgot-password' && (
          <button
            onClick={() => switchMode('login')}
            className={`inline-flex items-center gap-2 font-bold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
          >
            <ArrowLeft size={18} />
            Volver a iniciar sesion
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
