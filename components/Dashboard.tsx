
import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Bell, Calendar, Clock, AlertCircle, ChevronRight,
  CheckCircle2, BookOpen, GraduationCap, Sparkles, Trophy
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniPomodoro from './MiniPomodoro';

const Dashboard: React.FC = () => {
  const { 
    theme, activeProfileId, profiles, subjects, schedules, 
    tasks, exams, alerts, markAlertRead, sessions 
  } = useAppStore();
  
  const activeProfile = (profiles || []).find(p => p.id === activeProfileId);
  if (!activeProfile) return null;

  const today = new Date();
  const dayOfWeek = today.getDay();

  const todayClasses = (schedules || []).filter(s => {
    const subj = (subjects || []).find(sub => sub.id === s.subject_id);
    return subj?.profile_id === activeProfileId && s.day_of_week === dayOfWeek;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const unreadAlerts = (alerts || []).filter(a => a.profile_id === activeProfileId && !a.is_read);

  const upcomingTasks = (tasks || []).filter(t => {
      const subj = (subjects || []).find(s => s.id === t.subject_id);
      return subj?.profile_id === activeProfileId && t.status !== 'completed';
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 3);

  const statsToday = (sessions || []).filter(s =>
    s.profile_id === activeProfileId &&
    isSameDay(new Date(s.completed_at || s.started_at), today) &&
    s.status === 'completed'
  );

  const totalHoursToday = statsToday.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);

  return (
    <div className={`max-w-6xl mx-auto space-y-10 pb-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Sparkles className="text-indigo-500 animate-pulse" size={28} />
              <div className="absolute inset-0 blur-md bg-indigo-500/30 rounded-full" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Panel de Control
            </span>
          </div>
          <h1 className="text-6xl font-black tracking-tight leading-none mb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Hola, {activeProfile.user_name}
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold text-lg flex items-center gap-2`}>
            <Calendar size={18} className="text-indigo-500" />
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <div className={`relative flex items-center gap-8 p-8 rounded-[2.5rem] border-2 shadow-2xl animate-in slide-in-from-right duration-700 overflow-hidden card-hover-effect ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-slate-200'}`}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />

          <div className={`relative text-center pr-8 border-r-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="relative inline-block">
              <p className="text-4xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {statsToday.length}
              </p>
              <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Pomodoros</p>
          </div>

          <div className="relative text-center">
            <p className={`text-4xl font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
              {totalHoursToday.toFixed(1)}h
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Horas Hoy</p>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Columna izquierda - Contenido principal */}
        <div className="lg:col-span-2 space-y-10">
          {/* Próximas Tareas - Enfoque principal */}
          <section className={`p-10 rounded-[3.5rem] border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-3xl font-black mb-8 flex items-center gap-4 tracking-tight">
              <div className={`p-4 rounded-3xl ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <Clock size={28} />
              </div>
              Tareas Pendientes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTasks.length === 0 ? (
                <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                  <Trophy className="mx-auto mb-4 text-indigo-500" size={48} />
                  <p className="text-slate-400 text-lg font-bold">¡Todo al día! 🎉</p>
                  <p className="text-slate-500 text-sm mt-2">No tienes tareas urgentes pendientes</p>
                </div>
              ) : (
                upcomingTasks.map(task => {
                  const subj = subjects.find(s => s.id === task.subject_id);
                  return (
                    <div key={task.id} className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${theme === 'dark' ? 'border-slate-700 bg-slate-700/20 hover:bg-slate-700/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:shadow-lg'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-500 ring-2 ring-red-500/20' : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {task.priority}
                        </span>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{format(new Date(task.due_date), "d MMM", { locale: es })}</p>
                      </div>
                      <h4 className="font-black text-lg mb-2 group-hover:text-indigo-500 transition-colors">{task.title}</h4>
                      {subj && (
                        <div className="flex items-center gap-2 mt-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subj.color }} />
                          <span className="text-xs font-bold text-slate-400">{subj.name}</span>
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
            <section className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-white to-indigo-50/30 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <Calendar size={20} className="text-indigo-500" />
                  Clases de Hoy ({todayClasses.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayClasses.slice(0, 4).map(cls => {
                  const subj = subjects.find(s => s.id === cls.subject_id);
                  return (
                    <div key={cls.id} className={`p-5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: subj?.color || '#3B82F6' }} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{subj?.name}</h4>
                          <p className={`text-xs font-bold mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
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
            <MiniPomodoro duration={25} theme={theme} compact={false} />
          </div>

          {/* Meta Diaria */}
          <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-600/40 overflow-hidden group card-hover-effect">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-transparent to-pink-600/30 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl float-animation" style={{ animationDelay: '0s' }} />
              <div className="absolute top-1/2 right-10 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl float-animation" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-pink-300/10 rounded-full blur-2xl float-animation" style={{ animationDelay: '4s' }} />
            </div>

            {/* Icon decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <Trophy size={180} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-yellow-300" size={32} />
                <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/90">Meta Diaria</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-7xl font-black tracking-tight">{statsToday.length}</span>
                  <span className="text-3xl font-bold opacity-60">/ 8</span>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">POMODOROS COMPLETADOS</p>
                <p className="text-sm text-indigo-100 font-bold mt-4 leading-relaxed">
                  Progreso: <span className="text-2xl font-black text-white">{Math.round((statsToday.length / 8) * 100)}%</span>
                </p>
              </div>

              {/* Enhanced progress bar */}
              <div className="relative w-full h-6 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/20 shadow-inner mb-8">
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
                    <span className="text-xs font-black text-white drop-shadow-lg">
                      {Math.round((statsToday.length / 8) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Motivational message */}
              <div className="pt-6 border-t border-white/20">
                <p className="text-sm font-bold text-white/90 leading-relaxed">
                  {statsToday.length === 0 && "¡Comienza tu primer Pomodoro del día! 💪"}
                  {statsToday.length > 0 && statsToday.length < 4 && "¡Buen inicio! Sigue con ese ritmo 🔥"}
                  {statsToday.length >= 4 && statsToday.length < 8 && "¡Excelente progreso! Ya vas por la mitad ⭐"}
                  {statsToday.length >= 8 && "¡META ALCANZADA! Eres imparable 🏆"}
                </p>
              </div>
            </div>

            {/* Bottom glow effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent opacity-50" />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
