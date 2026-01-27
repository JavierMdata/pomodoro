import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Gift,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  X
} from 'lucide-react';

interface RedeemCodeProps {
  onSuccess?: () => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
}

interface RedeemResult {
  success: boolean;
  error?: string;
  plan?: string;
  expires_at?: string;
  message?: string;
}

const RedeemCode: React.FC<RedeemCodeProps> = ({ onSuccess, onClose, theme = 'light' }) => {
  const { refreshUserProfile } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);

  const isDark = theme === 'dark';

  // Formatear codigo mientras escribe (XXXX-XXXX-XXXX)
  const formatCode = (value: string) => {
    // Remover todo excepto letras y numeros
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Agregar guiones cada 4 caracteres
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join('-').substring(0, 14); // Max: XXXX-XXXX-XXXX
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(formatCode(e.target.value));
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || code.length < 10) {
      setResult({ success: false, error: 'Por favor ingresa un codigo valido' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('redeem_activation_code', {
        input_code: code
      });

      if (error) {
        setResult({ success: false, error: error.message });
      } else if (data) {
        setResult(data as RedeemResult);

        if (data.success) {
          // Refrescar perfil para actualizar el plan
          await refreshUserProfile();

          // Callback de exito
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        }
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message || 'Error al canjear codigo' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative p-8 rounded-3xl ${
      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-2xl'
    }`}>
      {/* Boton cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X size={20} />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
          isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'
        }`}>
          <Gift className="text-amber-500" size={32} />
        </div>
        <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Canjear Codigo
        </h2>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Ingresa tu codigo de activacion para desbloquear tu plan
        </p>
      </div>

      {/* Resultado exitoso */}
      {result?.success && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
            <div>
              <p className="font-bold text-green-600 dark:text-green-400">Codigo canjeado!</p>
              <div className="flex items-center gap-1">
                <Crown size={14} className="text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Plan {result.plan} activado
                </span>
              </div>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {result.message}
          </p>
        </div>
      )}

      {/* Resultado error */}
      {result && !result.success && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-600 dark:text-red-400 text-sm">{result.error}</p>
        </div>
      )}

      {/* Formulario */}
      {!result?.success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Codigo de activacion
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="POMO-XXXX-XXXX"
                disabled={isLoading}
                className={`w-full px-5 py-4 rounded-xl text-center text-xl font-mono font-bold tracking-widest uppercase outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-600'
                    : 'bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder-slate-300'
                } ${isLoading ? 'opacity-50' : ''}`}
              />
              <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                code.length >= 10 ? 'text-amber-500' : isDark ? 'text-slate-600' : 'text-slate-300'
              }`} size={20} />
            </div>
            <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              El codigo tiene formato XXXX-XXXX-XXXX
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 10}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isLoading || code.length < 10
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Verificando...
              </>
            ) : (
              <>
                <Gift size={20} />
                Canjear codigo
              </>
            )}
          </button>
        </form>
      )}

      {/* Info adicional */}
      <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          No tienes un codigo? Contacta al administrador para obtener acceso premium.
        </p>
      </div>
    </div>
  );
};

export default RedeemCode;
