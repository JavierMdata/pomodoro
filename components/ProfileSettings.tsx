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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Preferencias del Perfil
        </h1>
        <p className="text-slate-400 font-medium">
          Configura tu experiencia de estudio personalizada
        </p>
      </div>

      {/* Tiempos del Pomodoro */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Clock className="text-indigo-500" size={24} />
          </div>
          <div>
            <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Tiempos del Pomodoro
            </h3>
            <p className="text-sm text-slate-400">
              Personaliza la duración de tus sesiones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
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
              onChange={(e) => setShortBreak(parseInt(e.target.value) || 5)}
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
              onChange={(e) => setLongBreak(parseInt(e.target.value) || 15)}
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
              onChange={(e) => setPomsBeforeLong(parseInt(e.target.value) || 4)}
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
