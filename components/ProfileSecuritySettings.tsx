/**
 * Componente de configuración de seguridad del perfil
 */
import React, { useState } from 'react';
import { Profile } from '../types';
import { Lock, Unlock, Fingerprint, Clock, Shield, Check, X } from 'lucide-react';
import { soundService } from '../lib/soundService';

interface ProfileSecuritySettingsProps {
  profile: Profile;
  onUpdateSecurity: (updates: Partial<Profile>) => void;
  theme?: 'dark' | 'light';
}

// Función para hashear el PIN
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const ProfileSecuritySettings: React.FC<ProfileSecuritySettingsProps> = ({
  profile,
  onUpdateSecurity,
  theme = 'dark'
}) => {
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEnablePin = () => {
    setIsSettingPin(true);
    setNewPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleSavePin = async () => {
    // Validaciones
    if (newPin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      soundService.playError();
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError('El PIN solo puede contener números');
      soundService.playError();
      return;
    }

    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      soundService.playError();
      return;
    }

    // Hashear y guardar
    const pinHash = await hashPin(newPin);

    onUpdateSecurity({
      pin_hash: pinHash,
      requires_pin: true
    });

    soundService.playSuccess();
    soundService.vibrate([100, 50, 100]);

    setIsSettingPin(false);
    setNewPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleDisablePin = () => {
    if (window.confirm('¿Estás seguro de que quieres desactivar el PIN?')) {
      onUpdateSecurity({
        pin_hash: undefined,
        requires_pin: false
      });

      soundService.playClick();
    }
  };

  const handleToggleBiometric = () => {
    onUpdateSecurity({
      biometric_enabled: !profile.biometric_enabled
    });

    soundService.playToggle();
    soundService.vibrate(15);
  };

  const handleSetAutoLock = (minutes: number | undefined) => {
    onUpdateSecurity({
      auto_lock_minutes: minutes
    });

    soundService.playClick();
  };

  return (
    <div className={`p-6 rounded-2xl border ${
      theme === 'dark'
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Shield className="text-indigo-500" size={24} />
        </div>
        <div>
          <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Seguridad del Perfil
          </h3>
          <p className="text-sm text-slate-400">
            Protege tu información con PIN
          </p>
        </div>
      </div>

      {/* PIN Configuration */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-slate-400" />
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Bloqueo con PIN
            </span>
          </div>

          {profile.requires_pin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-green-500 flex items-center gap-1">
                <Check size={14} />
                Activo
              </span>
              <button
                onClick={handleDisablePin}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                Desactivar
              </button>
            </div>
          ) : (
            <button
              onClick={handleEnablePin}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Configurar PIN
            </button>
          )}
        </div>

        {/* PIN Setup Form */}
        {isSettingPin && (
          <div className={`p-4 rounded-xl border animate-in slide-in-from-top duration-300 ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-slate-50 border-slate-200'
          }`}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Nuevo PIN (4 dígitos)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    if (/^\d{0,4}$/.test(e.target.value)) {
                      setNewPin(e.target.value);
                      setError(null);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-mono text-lg font-bold text-center tracking-widest outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                  placeholder="••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Confirmar PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => {
                    if (/^\d{0,4}$/.test(e.target.value)) {
                      setConfirmPin(e.target.value);
                      setError(null);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-mono text-lg font-bold text-center tracking-widest outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                  placeholder="••••"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSavePin}
                  disabled={!newPin || !confirmPin}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Guardar PIN
                </button>
                <button
                  onClick={() => {
                    setIsSettingPin(false);
                    setNewPin('');
                    setConfirmPin('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biometric Authentication */}
      {profile.requires_pin && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint size={18} className="text-slate-400" />
              <div>
                <span className={`font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Autenticación Biométrica
                </span>
                <span className="text-xs text-slate-400">
                  Face ID / Touch ID
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.biometric_enabled}
                onChange={handleToggleBiometric}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* Auto Lock */}
      {profile.requires_pin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-slate-400" />
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Bloqueo Automático
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nunca', value: undefined },
              { label: '5 min', value: 5 },
              { label: '15 min', value: 15 },
              { label: '30 min', value: 30 },
              { label: '1 hora', value: 60 },
              { label: '2 horas', value: 120 }
            ].map(option => (
              <button
                key={option.label}
                onClick={() => handleSetAutoLock(option.value)}
                className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${
                  profile.auto_lock_minutes === option.value
                    ? 'bg-indigo-600 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSecuritySettings;
