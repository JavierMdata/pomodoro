/**
 * COMMAND CENTER DASHBOARD - Vista de Hoy
 * Diseño moderno inspirado en Linear, Notion y Fantastical
 * Muestra resumen del día, bloques activos, y acceso rápido
 */
import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance } from '../types';
import {
  Calendar, Clock, TrendingUp, CheckCircle, AlertCircle,
  BookOpen, Languages, Briefcase, Dumbbell, FolderKanban,
  Flame, Zap, ArrowRight, Coffee, Target, Timer, Sparkles
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
  const { theme, activeProfileId, categoryInstances, subjects, tasks, exams, sessions } = useAppStore();

  const profileInstances = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);
  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);

  const isDark = theme === 'dark';

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

    const profileTasks = tasks.filter(t => {
      const subject = profileSubjects.find(s => s.id === t.subject_id);
      return subject && t.status === 'pending';
    });
    const profileExams = exams.filter(e => {
      const subject = profileSubjects.find(s => s.id === e.subject_id);
      return subject && e.status === 'upcoming';
    });

    const todayPomodoros = sessions.filter(s => {
      const sessionDate = new Date(s.started_at);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalCategories,
      activeToday,
      pendingTasks: profileTasks.length,
      upcomingExams: profileExams.length,
      todayPomodoros
    };
  }, [profileInstances, todayBlocks, subjects, tasks, exams, sessions, activeProfileId]);

  const getCategoryIcon = (type: string, size = 20) => {
    const icons: Record<string, any> = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Coffee size={size} />,
      'otro': <Calendar size={size} />
    };
    return icons[type] || icons.otro;
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className={`max-w-7xl mx-auto space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header con saludo */}
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {greeting}
          </p>
          <h1 className="text-4xl font-black tracking-tight">Command Center</h1>
          <p className={`text-base font-medium mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <Clock size={16} className="text-indigo-500" />
          {format(new Date(), 'HH:mm')}
        </div>
      </div>

      {/* Stats Cards - Diseño moderno con gradientes */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Pomodoros Hoy',
            value: stats.todayPomodoros,
            icon: <Flame size={20} />,
            gradient: 'from-orange-500 to-amber-500',
            bgLight: 'bg-orange-50 border-orange-100',
            bgDark: 'bg-orange-500/10 border-orange-500/20',
            textColor: 'text-orange-500'
          },
          {
            label: 'Categorías',
            value: stats.totalCategories,
            icon: <FolderKanban size={20} />,
            gradient: 'from-indigo-500 to-purple-500',
            bgLight: 'bg-indigo-50 border-indigo-100',
            bgDark: 'bg-indigo-500/10 border-indigo-500/20',
            textColor: 'text-indigo-500'
          },
          {
            label: 'Activo Hoy',
            value: stats.activeToday,
            icon: <Zap size={20} />,
            gradient: 'from-emerald-500 to-teal-500',
            bgLight: 'bg-emerald-50 border-emerald-100',
            bgDark: 'bg-emerald-500/10 border-emerald-500/20',
            textColor: 'text-emerald-500'
          },
          {
            label: 'Tareas',
            value: stats.pendingTasks,
            icon: <Target size={20} />,
            gradient: 'from-amber-500 to-yellow-500',
            bgLight: 'bg-amber-50 border-amber-100',
            bgDark: 'bg-amber-500/10 border-amber-500/20',
            textColor: 'text-amber-500'
          },
          {
            label: 'Exámenes',
            value: stats.upcomingExams,
            icon: <AlertCircle size={20} />,
            gradient: 'from-red-500 to-rose-500',
            bgLight: 'bg-red-50 border-red-100',
            bgDark: 'bg-red-500/10 border-red-500/20',
            textColor: 'text-red-500'
          }
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden p-5 rounded-2xl border transition-all hover:scale-[1.02] ${
              isDark ? stat.bgDark : stat.bgLight
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Bloques de Hoy - Timeline */}
      {todayBlocks.length > 0 && (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Timer size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black">Agenda de Hoy</h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {todayBlocks.length} {todayBlocks.length === 1 ? 'actividad' : 'actividades'} programadas
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {todayBlocks.map((block, index) => (
              <div
                key={block.instance.id}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  block.isActive
                    ? isDark
                      ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100'
                    : block.isPast
                    ? isDark
                      ? 'bg-slate-800/30 border-slate-700/50 opacity-50'
                      : 'bg-slate-50 border-slate-200 opacity-50'
                    : isDark
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Indicator */}
                {block.isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                )}

                {/* Icon */}
                <div
                  className="p-3 rounded-xl text-white flex-shrink-0 shadow-lg"
                  style={{ backgroundColor: block.instance.color }}
                >
                  {getCategoryIcon(block.instance.category_type, 20)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base truncate">{block.instance.name}</h3>
                    {block.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex-shrink-0">
                        En curso
                      </span>
                    )}
                    {block.isPast && (
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {block.instance.category_type.charAt(0).toUpperCase() + block.instance.category_type.slice(1)}
                  </p>
                </div>

                {/* Time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black">{block.startTime}</p>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {block.endTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materias activas */}
      {profileSubjects.length > 0 && (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black">Materias</h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {profileSubjects.length} {profileSubjects.length === 1 ? 'materia activa' : 'materias activas'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {profileSubjects.slice(0, 8).map(subject => (
              <div
                key={subject.id}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                style={{ borderLeftWidth: '3px', borderLeftColor: subject.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h4 className="font-bold text-sm truncate">{subject.name}</h4>
                </div>
                {subject.professor_name && (
                  <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {subject.professor_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendario Semanal */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <WeeklyCalendar theme={theme} />
      </div>
    </div>
  );
};

export default CommandCenterDashboard;
