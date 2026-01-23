/**
 * Pantalla de Bienvenida al Perfil
 * Se muestra al ingresar - cubre toda la pantalla
 */
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Profile } from '../types';
import { Flame, Trophy, Target, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { soundService } from '../lib/soundService';

interface WelcomeScreenProps {
  profile: Profile;
  onDismiss: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ profile, onDismiss }) => {
  const { theme, tasks, subjects, sessions } = useAppStore();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    soundService.playWhoosh();
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  // Calcular estadísticas del día - con valores por defecto para evitar errores
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = (sessions || []).filter(s =>
    s.profile_id === profile.id &&
    s.started_at?.startsWith(today)
  );
  const todayPomodoros = todaySessions.filter(s => s.session_type === 'work').length;

  const pendingTasks = (tasks || []).filter(t => {
    const taskSubject = (subjects || []).find(s => s.id === t.subject_id);
    return taskSubject?.profile_id === profile.id && t.status !== 'completed';
  });

  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 animate-in fade-in duration-500"
      onClick={handleDismiss}
    >
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-8 animate-in zoom-in slide-in-from-bottom duration-700">
        {/* Avatar del perfil */}
        <div
          className="w-32 h-32 md:w-40 md:h-40 rounded-3xl flex items-center justify-center text-white font-black text-6xl md:text-7xl shadow-2xl mx-auto mb-8 animate-in zoom-in duration-500"
          style={{
            background: `linear-gradient(135deg, ${profile.color}, ${profile.color}dd)`
          }}
        >
          {profile.icon || profile.name.charAt(0)}
        </div>

        {/* Saludo personalizado */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
          ¡Hola, {profile.user_name}! 👋
        </h1>

        <p className="text-2xl md:text-3xl text-indigo-300 font-bold mb-12 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
          {profile.name} • {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
        </p>

        {/* Título principal */}
        <div className="mb-16 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="text-yellow-400" size={48} />
            <h2 className="text-4xl md:text-5xl font-black text-white">
              ¿Qué hay para hoy?
            </h2>
            <Sparkles className="text-yellow-400" size={48} />
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '800ms' }}>
          {/* Pomodoros de hoy */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
            <Flame className="text-orange-400 mx-auto mb-3" size={32} />
            <div className="text-4xl font-black text-white mb-1">{todayPomodoros}</div>
            <div className="text-sm text-slate-300 font-bold">Pomodoros Hoy</div>
          </div>

          {/* Tareas pendientes */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
            <Target className="text-indigo-400 mx-auto mb-3" size={32} />
            <div className="text-4xl font-black text-white mb-1">{pendingTasks.length}</div>
            <div className="text-sm text-slate-300 font-bold">Tareas Pendientes</div>
          </div>

          {/* Tareas urgentes */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
            <Trophy className="text-yellow-400 mx-auto mb-3" size={32} />
            <div className="text-4xl font-black text-white mb-1">{urgentTasks.length}</div>
            <div className="text-sm text-slate-300 font-bold">Urgentes</div>
          </div>

          {/* Materias activas */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
            <BookOpen className="text-green-400 mx-auto mb-3" size={32} />
            <div className="text-4xl font-black text-white mb-1">
              {(subjects || []).filter(s => s.profile_id === profile.id).length}
            </div>
            <div className="text-sm text-slate-300 font-bold">Materias</div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '1000ms' }}>
          <p className="text-lg text-slate-300 mb-6">
            Haz clic en cualquier parte para continuar
          </p>
          <div className="flex items-center justify-center gap-3 text-indigo-400 animate-bounce">
            <ArrowRight size={24} />
            <span className="font-bold">Empezar</span>
            <ArrowRight size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
