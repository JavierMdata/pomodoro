/**
 * Configuración Completa del Perfil
 * Incluye: Pomodoro Settings + Security Settings (PIN)
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import ProfileSecuritySettings from './ProfileSecuritySettings';
import { Clock, Save, Shield } from 'lucide-react';
import { soundService } from '../lib/soundService';

const ProfileSettings: React.FC = () => {
  const { theme, activeProfileId, profiles, settings, updatePomodoroSettings } = useAppStore();

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const currentSettings = activeProfileId ? settings[activeProfileId] : null;

  const [workDuration, setWorkDuration] = useState(currentSettings?.work_duration || 25);
  const [shortBreak, setShortBreak] = useState(currentSettings?.short_break || 5);
  const [longBreak, setLongBreak] = useState(currentSettings?.long_break || 15);
  const [pomsBeforeLong, setPomsBeforeLong] = useState(currentSettings?.poms_before_long || 4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(currentSettings?.auto_start_breaks || false);

  const [saved, setSaved] = useState(false);

  // Sincronizar los valores del formulario cuando cambia el perfil o los settings
  React.useEffect(() => {
    if (currentSettings) {
      setWorkDuration(currentSettings.work_duration || 25);
      setShortBreak(currentSettings.short_break || 5);
      setLongBreak(currentSettings.long_break || 15);
      setPomsBeforeLong(currentSettings.poms_before_long || 4);
      setAutoStartBreaks(currentSettings.auto_start_breaks || false);
    }
  }, [activeProfileId, currentSettings]);

  if (!activeProfile || !activeProfileId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400 font-medium">Selecciona un perfil primero</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!activeProfileId) return;

    updatePomodoroSettings(activeProfileId, {
      work_duration: workDuration,
      short_break: shortBreak,
      long_break: longBreak,
      poms_before_long: pomsBeforeLong,
      auto_start_breaks: autoStartBreaks
    });

    soundService.playSuccess();
    soundService.vibrate([100, 50, 100]);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSecurityUpdate = (updates: Partial<typeof activeProfile>) => {
    // Aquí se debería actualizar el perfil en el store
    // Por ahora solo mostramos el componente
    console.log('Security updates:', updates);
    soundService.playSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className={`text-3xl md:text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Preferencias del Perfil
        </h1>
        <p className="text-slate-400 font-medium text-sm md:text-base">
          Configura tu experiencia de estudio personalizada
        </p>
      </div>

      {/* Tiempos del Pomodoro */}
      <div className={`p-4 md:p-6 rounded-2xl border ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="p-2 md:p-3 bg-indigo-500/10 rounded-xl">
            <Clock className="text-indigo-500" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-black text-base md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Tiempos del Pomodoro
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Personaliza la duración de tus sesiones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Tiempo de trabajo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Tiempo de Trabajo (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={workDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 60) {
                  setWorkDuration(val);
                } else if (e.target.value === '') {
                  setWorkDuration(1);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl font-bold text-lg outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Descanso corto */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Descanso Corto (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreak}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 30) {
                  setShortBreak(val);
                } else if (e.target.value === '') {
                  setShortBreak(1);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl font-bold text-lg outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Descanso largo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Descanso Largo (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreak}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 60) {
                  setLongBreak(val);
                } else if (e.target.value === '') {
                  setLongBreak(1);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl font-bold text-lg outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Pomodoros hasta descanso largo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Pomodoros hasta Descanso Largo
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={pomsBeforeLong}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 2 && val <= 10) {
                  setPomsBeforeLong(val);
                } else if (e.target.value === '') {
                  setPomsBeforeLong(2);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl font-bold text-lg outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Auto-iniciar descansos */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Auto-iniciar descansos
              </span>
              <span className="text-xs text-slate-400">
                Comienza el descanso automáticamente al terminar el trabajo
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {saved ? (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Guardado!
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar Preferencias
            </>
          )}
        </button>
      </div>

      {/* Configuración de Seguridad (PIN) */}
      <ProfileSecuritySettings
        profile={activeProfile}
        onUpdateSecurity={handleSecurityUpdate}
        theme={theme}
      />
    </div>
  );
};

export default ProfileSettings;
