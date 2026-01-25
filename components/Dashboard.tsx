
import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Bell, Calendar, Clock, AlertCircle, ChevronRight,
  CheckCircle2, BookOpen, GraduationCap, Sparkles, Trophy, Flame
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniPomodoro from './MiniPomodoro';

const Dashboard: React.FC = () => {
  const {
    theme, activeProfileId, profiles, subjects, schedules = [],
    tasks, exams, alerts, markAlertRead, sessions, addSession, settings
  } = useAppStore();

  const activeProfile = (profiles || []).find(p => p.id === activeProfileId);
  if (!activeProfile) return null;

  const today = new Date();
  const dayOfWeek = today.getDay();

  // Obtener settings del perfil activo
  const currentSettings = activeProfileId ? settings[activeProfileId] : null;
  const workDuration = currentSettings?.work_duration || 25;

  const todayClasses = (schedules || []).filter(s => {
    const subj = (subjects || []).find(sub => sub.id === s.subject_id);
    return subj?.profile_id === activeProfileId && s.day_of_week === dayOfWeek;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const unreadAlerts = (alerts || []).filter(a => a.profile_id === activeProfileId && !a.is_read);

  const upcomingTasks = (tasks || []).filter(t => {
      const subj = (subjects || []).find(s => s.id === t.subject_id);
      return subj?.profile_id === activeProfileId && t.status !== 'completed';
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 3);

  // Filtrar solo sesiones de trabajo completadas de hoy
  const statsToday = (sessions || []).filter(s =>
    s.profile_id === activeProfileId &&
    isSameDay(new Date(s.completed_at || s.started_at), today) &&
    s.status === 'completed' &&
    s.session_type === 'work'
  );

  const totalHoursToday = statsToday.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);

  // Handler para cuando MiniPomodoro completa una sesión
  const handleMiniPomodoroComplete = () => {
    if (!activeProfileId) return;

    addSession({
      profile_id: activeProfileId,
      session_type: 'work',
      planned_duration_minutes: workDuration,
      duration_seconds: workDuration * 60,
      status: 'completed',
      focus_rating: 3,
      started_at: new Date(Date.now() - workDuration * 60 * 1000).toISOString(),
      completed_at: new Date().toISOString()
    });
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 md:space-y-10 pb-8 md:pb-12 px-4 md:px-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
        <div className="animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="relative">
              <Sparkles className="text-indigo-500 animate-pulse w-5 h-5 md:w-7 md:h-7" />
              <div className="absolute inset-0 blur-md bg-indigo-500/30 rounded-full" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Panel de Control
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-2 md:mb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Hola, {activeProfile.user_name}
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold text-sm md:text-lg flex items-center gap-2`}>
            <Calendar className="text-indigo-500 w-4 h-4 md:w-5 md:h-5" />
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Stats Card - Responsive */}
        <div className={`relative flex items-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 shadow-xl md:shadow-2xl animate-in slide-in-from-right duration-700 overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-slate-200'}`}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />

          <div className={`relative text-center pr-4 sm:pr-6 md:pr-8 border-r-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="relative inline-block">
              <div className="flex items-center gap-1.5 justify-center">
                <Flame className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" />
                <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {statsToday.length}
                </p>
              </div>
              <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-slate-400 mt-1 md:mt-2">HOY</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500">pomodoros</p>
          </div>

          <div className="relative text-center">
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
              {totalHoursToday.toFixed(1)}h
            </p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-slate-400 mt-1 md:mt-2">Horas Hoy</p>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min((statsToday.length / 8) * 100, 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Alertas - Máxima prioridad */}
      {unreadAlerts.length > 0 && (
        <section className={`p-8 rounded-[3rem] space-y-6 border animate-in fade-in duration-500 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>
            <Bell size={24} className="animate-pulse" />
            <h3 className="text-xl font-black">Alertas ({unreadAlerts.length})</h3>
          </div>
          <div className="space-y-4">
            {unreadAlerts.map(alert => (
              <div key={alert.id} className={`p-5 rounded-3xl flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-slate-800/80 hover:bg-slate-700/80' : 'bg-white hover:shadow-md'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-2 h-10 rounded-full ${alert.priority === 'urgent' ? 'bg-red-500' : 'bg-amber-500'}`} />
                   <div>
                    <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{alert.title}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{alert.message}</p>
                  </div>
                </div>
                <button
                    onClick={() => markAlertRead(alert.id)}
                    className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                >
                  <CheckCircle2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Layout principal: Meta diaria destacada + Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Columna izquierda - Contenido principal */}
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          {/* Próximas Tareas - Enfoque principal */}
          <section className={`p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3.5rem] border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 md:mb-6 lg:mb-8 flex items-center gap-3 md:gap-4 tracking-tight">
              <div className={`p-2.5 md:p-3 lg:p-4 rounded-xl md:rounded-2xl lg:rounded-3xl ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <Clock className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              </div>
              Tareas Pendientes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {upcomingTasks.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 py-12 md:py-16 lg:py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl md:rounded-3xl">
                  <Trophy className="mx-auto mb-3 md:mb-4 text-indigo-500 w-10 h-10 md:w-12 md:h-12" />
                  <p className="text-slate-400 text-base md:text-lg font-bold">¡Todo al día!</p>
                  <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2">No tienes tareas urgentes pendientes</p>
                </div>
              ) : (
                upcomingTasks.map(task => {
                  const subj = subjects.find(s => s.id === task.subject_id);
                  return (
                    <div key={task.id} className={`p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2rem] border transition-all cursor-pointer group ${theme === 'dark' ? 'border-slate-700 bg-slate-700/20 hover:bg-slate-700/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:shadow-lg'}`}>
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <span className={`text-[9px] md:text-[10px] px-2 md:px-3 py-1 md:py-1.5 rounded-full font-black uppercase tracking-wider md:tracking-widest ${
                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-500 ring-2 ring-red-500/20' : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {task.priority}
                        </span>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider md:tracking-widest">{format(new Date(task.due_date), "d MMM", { locale: es })}</p>
                      </div>
                      <h4 className="font-black text-base md:text-lg mb-1 md:mb-2 group-hover:text-indigo-500 transition-colors line-clamp-2">{task.title}</h4>
                      {subj && (
                        <div className="flex items-center gap-2 mt-2 md:mt-3">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subj.color }} />
                          <span className="text-[10px] md:text-xs font-bold text-slate-400 truncate">{subj.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Resumen de Clases de Hoy - Compacto */}
          {todayClasses.length > 0 && (
            <section className={`p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-white to-indigo-50/30 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg lg:text-xl font-black tracking-tight flex items-center gap-2 md:gap-3">
                  <Calendar className="text-indigo-500 w-4 h-4 md:w-5 md:h-5" />
                  Clases de Hoy ({todayClasses.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {todayClasses.slice(0, 4).map(cls => {
                  const subj = subjects.find(s => s.id === cls.subject_id);
                  return (
                    <div key={cls.id} className={`p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-1 h-10 md:h-12 rounded-full flex-shrink-0" style={{ backgroundColor: subj?.color || '#3B82F6' }} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs md:text-sm truncate">{subj?.name}</h4>
                          <p className={`text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {cls.start_time} - {cls.end_time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Columna derecha - Meta diaria y Pomodoro */}
        <div className="space-y-6">
          {/* Mini Pomodoro Widget */}
          <div className="sticky top-6">
            <MiniPomodoro
              duration={workDuration}
              theme={theme}
              compact={false}
              onComplete={handleMiniPomodoroComplete}
            />
          </div>

          {/* Meta Diaria */}
          <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3.5rem] text-white shadow-xl md:shadow-2xl shadow-indigo-600/40 overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-transparent to-pink-600/30 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

            {/* Floating particles effect - Hidden on mobile */}
            <div className="absolute inset-0 overflow-hidden hidden md:block">
              <div className="absolute top-10 left-10 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-1/2 right-10 w-24 md:w-32 h-24 md:h-32 bg-purple-300/10 rounded-full blur-2xl" />
            </div>

            {/* Icon decoration */}
            <div className="absolute top-0 right-0 p-6 md:p-8 lg:p-12 opacity-5 pointer-events-none">
              <Trophy className="w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Trophy className="text-yellow-300 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                <h3 className="text-sm md:text-base lg:text-xl font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-white/90">Meta Diaria</h3>
              </div>

              <div className="mb-5 md:mb-8">
                <div className="flex items-baseline gap-2 md:gap-3 mb-2 md:mb-4">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">{statsToday.length}</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold opacity-60">/ 8</span>
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest text-indigo-200 mb-1 md:mb-2">POMODOROS COMPLETADOS</p>
                <p className="text-xs md:text-sm text-indigo-100 font-bold mt-2 md:mt-4 leading-relaxed">
                  Progreso: <span className="text-lg md:text-xl lg:text-2xl font-black text-white">{Math.round((statsToday.length / 8) * 100)}%</span>
                </p>
              </div>

              {/* Enhanced progress bar */}
              <div className="relative w-full h-4 md:h-5 lg:h-6 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/20 shadow-inner mb-5 md:mb-8">
                <div
                  className="h-full bg-gradient-to-r from-white via-yellow-200 to-white shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${Math.min((statsToday.length / 8) * 100, 100)}%` }}
                >
                  {/* Shimmer effect on progress bar */}
                  <div className="absolute inset-0 shimmer" />
                </div>

                {/* Percentage label */}
                {statsToday.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] md:text-xs font-black text-white drop-shadow-lg">
                      {Math.round((statsToday.length / 8) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Motivational message */}
              <div className="pt-4 md:pt-6 border-t border-white/20">
                <p className="text-xs md:text-sm font-bold text-white/90 leading-relaxed">
                  {statsToday.length === 0 && "¡Comienza tu primer Pomodoro!"}
                  {statsToday.length > 0 && statsToday.length < 4 && "¡Buen inicio! Sigue así"}
                  {statsToday.length >= 4 && statsToday.length < 8 && "¡Excelente! Ya vas por la mitad"}
                  {statsToday.length >= 8 && "¡META ALCANZADA!"}
                </p>
              </div>
            </div>

            {/* Bottom glow effect */}
            <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 lg:h-32 bg-gradient-to-t from-purple-900/50 to-transparent opacity-50" />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
