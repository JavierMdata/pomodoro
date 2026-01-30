/**
 * COMMAND CENTER DASHBOARD - Vista de Hoy
 * Muestra los bloques de tiempo activos según el horario configurado
 */
import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance } from '../types';
import {
  Calendar, Clock, TrendingUp, CheckCircle, AlertCircle,
  BookOpen, Languages, Briefcase, Dumbbell, FolderKanban
} from 'lucide-react';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import WeeklyCalendar from './WeeklyCalendar';

interface TodayBlock {
  instance: CategoryInstance;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isPast: boolean;
}

const CommandCenterDashboard: React.FC = () => {
  const { theme, activeProfileId, categoryInstances, subjects, tasks, exams } = useAppStore();

  const profileInstances = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);

  // Bloques de hoy
  const todayBlocks = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const currentTime = format(today, 'HH:mm');

    const blocks: TodayBlock[] = [];

    profileInstances.forEach(instance => {
      if (instance.schedule_days.includes(currentDayOfWeek)) {
        const isPast = currentTime > instance.schedule_end_time;
        const isActive = currentTime >= instance.schedule_start_time && currentTime <= instance.schedule_end_time;

        blocks.push({
          instance,
          startTime: instance.schedule_start_time,
          endTime: instance.schedule_end_time,
          isActive,
          isPast
        });
      }
    });

    return blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [profileInstances]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalCategories = profileInstances.length;
    const activeToday = todayBlocks.length;

    const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
    const profileTasks = tasks.filter(t => {
      const subject = profileSubjects.find(s => s.id === t.subject_id);
      return subject && t.status === 'pending';
    });
    const profileExams = exams.filter(e => {
      const subject = profileSubjects.find(s => s.id === e.subject_id);
      return subject && e.status === 'upcoming';
    });

    return {
      totalCategories,
      activeToday,
      pendingTasks: profileTasks.length,
      upcomingExams: profileExams.length
    };
  }, [profileInstances, todayBlocks, subjects, tasks, exams, activeProfileId]);

  const getCategoryIcon = (type: string, size = 20) => {
    const icons: Record<string, any> = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Clock size={size} />,
      'otro': <Calendar size={size} />
    };
    return icons[type] || icons.otro;
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black">Command Center</h1>
        <p className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-indigo-500" />
            <p className="text-xs font-bold text-slate-400">CATEGORÍAS</p>
          </div>
          <p className="text-2xl font-black">{stats.totalCategories}</p>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-emerald-500" />
            <p className="text-xs font-bold text-slate-400">HOY</p>
          </div>
          <p className="text-2xl font-black">{stats.activeToday}</p>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-amber-500" />
            <p className="text-xs font-bold text-slate-400">TAREAS</p>
          </div>
          <p className="text-2xl font-black">{stats.pendingTasks}</p>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-red-500" />
            <p className="text-xs font-bold text-slate-400">EXÁMENES</p>
          </div>
          <p className="text-2xl font-black">{stats.upcomingExams}</p>
        </div>
      </div>

      {/* Calendario Semanal */}
      <WeeklyCalendar theme={theme} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl cursor-pointer hover:scale-105 transition-all ${
          theme === 'dark' ? 'bg-indigo-900/50 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'
        }`}>
          <BookOpen size={24} className="text-indigo-500 mb-2" />
          <p className="font-bold">Materias</p>
          <p className="text-xs text-slate-400">Gestiona tus materias</p>
        </div>

        <div className={`p-4 rounded-xl cursor-pointer hover:scale-105 transition-all ${
          theme === 'dark' ? 'bg-purple-900/50 border border-purple-800' : 'bg-purple-50 border border-purple-200'
        }`}>
          <Clock size={24} className="text-purple-500 mb-2" />
          <p className="font-bold">Pomodoro</p>
          <p className="text-xs text-slate-400">Iniciar sesión enfocada</p>
        </div>

        <div className={`p-4 rounded-xl cursor-pointer hover:scale-105 transition-all ${
          theme === 'dark' ? 'bg-emerald-900/50 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'
        }`}>
          <TrendingUp size={24} className="text-emerald-500 mb-2" />
          <p className="font-bold">Estadísticas</p>
          <p className="text-xs text-slate-400">Ver tu progreso</p>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterDashboard;
