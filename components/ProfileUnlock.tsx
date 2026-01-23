/**
 * Componente de desbloqueo de perfil con PIN y autenticación biométrica
 */
import React, { useState, useEffect, useRef } from 'react';
import { Profile } from '../types';
import { Lock, Fingerprint, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { soundService } from '../lib/soundService';

interface ProfileUnlockProps {
  profile: Profile;
  onUnlock: () => void;
  onCancel?: () => void;
  theme?: 'dark' | 'light';
}

// Función para hashear el PIN (simple pero seguro para cliente)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Función para verificar si el navegador soporta autenticación biométrica
async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}

export const ProfileUnlock: React.FC<ProfileUnlockProps> = ({
  profile,
  onUnlock,
  onCancel,
  theme = 'dark'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Verificar disponibilidad de biométricos al montar
  useEffect(() => {
    if (profile.biometric_enabled) {
      isBiometricAvailable().then(setBiometricAvailable);
    }
  }, [profile.biometric_enabled]);

  // Auto-focus en el primer input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Verificar el PIN
  const verifyPin = async (enteredPin: string) => {
    if (!profile.pin_hash) {
      // Si no hay PIN configurado, desbloquear directamente
      onUnlock();
      return;
    }

    setIsProcessing(true);
    const hash = await hashPin(enteredPin);

    if (hash === profile.pin_hash) {
      // PIN correcto
      soundService.playSuccess();
      soundService.vibrate([100, 50, 100]);
      onUnlock();
    } else {
      // PIN incorrecto
      soundService.playError();
      soundService.vibrate([200, 100, 200]);
      setError('PIN incorrecto');
      setAttempts(prev => prev + 1);
      setPin('');

      // Limpiar inputs
      inputRefs.current.forEach(input => {
        if (input) input.value = '';
      });
      inputRefs.current[0]?.focus();

      // Bloquear temporalmente después de 3 intentos fallidos
      if (attempts >= 2) {
        setIsLocked(true);
        setError('Demasiados intentos. Bloqueado por 30 segundos.');
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          setError(null);
        }, 30000);
      }

      setTimeout(() => setError(null), 3000);
    }

    setIsProcessing(false);
  };

  // Manejar input de dígito individual
  const handleDigitInput = (index: number, value: string) => {
    if (isLocked || isProcessing) return;

    // Solo permitir números
    if (!/^\d?$/.test(value)) return;

    const newPin = pin.split('');
    newPin[index] = value;
    const updatedPin = newPin.join('').slice(0, 4);
    setPin(updatedPin);

    // Auto-focus en siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si se completaron los 4 dígitos, verificar
    if (updatedPin.length === 4) {
      setTimeout(() => verifyPin(updatedPin), 300);
    }
  };

  // Manejar backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Autenticación biométrica
  const handleBiometricAuth = async () => {
    if (!biometricAvailable || isLocked) return;

    setIsProcessing(true);

    try {
      // Solicitar autenticación biométrica
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32), // En producción, usar challenge del servidor
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000,
        }
      } as any);

      if (credential) {
        soundService.playSuccess();
        soundService.vibrate([100, 50, 100, 50, 100]);
        onUnlock();
      }
    } catch (error) {
      console.log('Biometric auth cancelled or failed:', error);
      setError('Autenticación biométrica cancelada');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md mx-4 p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-500 ${
        theme === 'dark'
          ? 'bg-slate-900 border border-slate-800'
          : 'bg-white border border-slate-200'
      }`}>
        {/* Botón de cerrar */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-lg transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            aria-label="Cancelar"
          >
            <X size={20} />
          </button>
        )}

        {/* Icono de perfil */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${profile.color}, ${profile.color}dd)`
            }}
          >
            {profile.name.charAt(0)}
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Desbloquear Perfil
          </h2>
          <p className="text-slate-400 font-medium">
            {profile.name}
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-500 text-sm font-bold flex-1">{error}</p>
          </div>
        )}

        {/* Inputs de PIN */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="text-indigo-500" size={20} />
            <span className="text-sm font-black uppercase tracking-widest text-slate-400">
              Ingresa tu PIN
            </span>
          </div>

          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                disabled={isLocked || isProcessing}
                value={pin[index] || ''}
                onChange={(e) => handleDigitInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-16 text-center text-2xl font-black rounded-xl border-2 transition-all outline-none ${
                  isLocked || isProcessing
                    ? 'opacity-50 cursor-not-allowed bg-slate-800'
                    : theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
                aria-label={`Dígito ${index + 1} del PIN`}
              />
            ))}
          </div>

          {/* Indicador de progreso */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  pin[index] ? 'bg-indigo-500 scale-110' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Botón de autenticación biométrica */}
        {biometricAvailable && profile.biometric_enabled && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                O
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <button
              onClick={handleBiometricAuth}
              disabled={isLocked || isProcessing}
              className="w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
            >
              <Fingerprint size={24} />
              <span>Usar Face ID / Touch ID</span>
            </button>
          </div>
        )}

        {/* Info de intentos */}
        {attempts > 0 && !isLocked && (
          <div className="text-center text-sm text-amber-500 font-medium">
            {3 - attempts} {3 - attempts === 1 ? 'intento restante' : 'intentos restantes'}
          </div>
        )}

        {/* Shield icon (decorativo) */}
        <div className="flex justify-center mt-6 opacity-20">
          <ShieldCheck size={32} className="text-indigo-500" />
        </div>
      </div>
    </div>
  );
};

export default ProfileUnlock;

/**
 * Hook para manejar el bloqueo automático por inactividad
 */
export function useAutoLock(
  profile: Profile | null,
  onLock: () => void
) {
  useEffect(() => {
    if (!profile || !profile.auto_lock_minutes) {
      return;
    }

    const lockTimeout = profile.auto_lock_minutes * 60 * 1000; // Convertir a ms
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('🔒 Bloqueando perfil por inactividad');
        onLock();
      }, lockTimeout);
    };

    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [profile, onLock]);
}
