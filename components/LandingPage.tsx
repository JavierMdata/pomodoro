/**
 * LANDING PAGE - Página principal profesional
 * Se muestra cuando no hay perfil activo
 * Incluye botón "Mi Cuenta" para acceder a perfiles
 */
import React, { useState } from 'react';
import { Profile } from '../types';
import ProfileCard from './ProfileCard';
import { User, Plus, X, Trash2, Moon, Sun, Flame, BarChart3, Clock, BookOpen } from 'lucide-react';

interface LandingPageProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: () => void;
  onDeleteProfile: (e: React.MouseEvent, profileId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  toggleTheme,
  profiles,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile
}) => {
  const [showAccountModal, setShowAccountModal] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen flex flex-col transition-colors duration-500 overflow-hidden ${
      isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }} />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl">
            <Flame className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              PomoSmart
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Command Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mi Cuenta Button */}
          <button
            onClick={() => setShowAccountModal(true)}
            className={`px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <User size={20} />
            Mi Cuenta
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
              isDark
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Organiza tu vida
              </span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Control total de tus estudios, trabajo y proyectos
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className={`p-6 rounded-2xl backdrop-blur-xl ${
              isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white/50 border border-slate-200'
            }`}>
              <div className="p-3 rounded-xl bg-indigo-500/20 w-fit mx-auto mb-4">
                <Clock className="text-indigo-500" size={32} />
              </div>
              <h3 className="font-black text-lg mb-2">Pomodoro</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Técnica Pomodoro integrada para máxima productividad
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-xl ${
              isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white/50 border border-slate-200'
            }`}>
              <div className="p-3 rounded-xl bg-purple-500/20 w-fit mx-auto mb-4">
                <BookOpen className="text-purple-500" size={32} />
              </div>
              <h3 className="font-black text-lg mb-2">Materias</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Gestiona todas tus materias, horarios y exámenes
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-xl ${
              isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white/50 border border-slate-200'
            }`}>
              <div className="p-3 rounded-xl bg-pink-500/20 w-fit mx-auto mb-4">
                <BarChart3 className="text-pink-500" size={32} />
              </div>
              <h3 className="font-black text-lg mb-2">Estadísticas</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Visualiza tu progreso y rendimiento en tiempo real
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <button
              onClick={() => setShowAccountModal(true)}
              className="px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
              style={{
                boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
              }}
            >
              {profiles.length > 0 ? 'Acceder a mi cuenta' : 'Crear mi primera cuenta'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b backdrop-blur-xl ${
              isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }">
              <div>
                <h2 className="text-2xl font-black">
                  {profiles.length > 0 ? 'Mis Perfiles' : 'Crear Perfil'}
                </h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {profiles.length > 0
                    ? `Tienes ${profiles.length} ${profiles.length === 1 ? 'perfil' : 'perfiles'} creados`
                    : 'Crea tu primer perfil para empezar'}
                </p>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {profiles.length === 0 ? (
                // No profiles - Show create button
                <div className="text-center py-12">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 w-fit mx-auto mb-6">
                    <User size={64} className="text-indigo-500" />
                  </div>
                  <p className={`text-lg font-medium mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    No tienes perfiles creados aún
                  </p>
                  <button
                    onClick={() => {
                      setShowAccountModal(false);
                      onCreateProfile();
                    }}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all hover:scale-105"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Crear mi primer perfil
                  </button>
                </div>
              ) : (
                // Show profiles grid
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {profiles.map(profile => (
                      <div key={profile.id} className="relative group">
                        <div onClick={() => {
                          onSelectProfile(profile.id);
                          setShowAccountModal(false);
                        }}>
                          <ProfileCard profile={profile} onClick={() => {}} />
                        </div>
                        <button
                          onClick={(e) => onDeleteProfile(e, profile.id)}
                          className={`absolute -top-2 -right-2 p-2 border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-red-400'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
                          }`}
                          title="Eliminar perfil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Profile Button */}
                  <button
                    onClick={() => {
                      setShowAccountModal(false);
                      onCreateProfile();
                    }}
                    className={`w-full py-4 rounded-xl font-bold border-2 border-dashed transition-all hover:scale-[1.02] ${
                      isDark
                        ? 'border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10'
                        : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    <Plus size={20} className="inline mr-2" />
                    Crear nuevo perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
