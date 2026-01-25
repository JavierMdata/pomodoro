
import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Bell, Calendar, Clock, AlertCircle, ChevronRight,
  CheckCircle2, BookOpen, GraduationCap, Sparkles, Trophy, Flame,
  Play, Timer, Target, TrendingUp
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

  // Filtrar materias del perfil activo
  const activeSubjects = (subjects || []).filter(s => s.profile_id === activeProfileId).slice(0, 3);

  // Filtrar solo sesiones de trabajo completadas de hoy
  const statsToday = (sessions || []).filter(s =>
    s.profile_id === activeProfileId &&
    isSameDay(new Date(s.completed_at || s.started_at), today) &&
    s.status === 'completed' &&
    s.session_type === 'work'
  );

  const totalHoursToday = statsToday.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);

  // Stats de la semana
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);
  const statsWeek = (sessions || []).filter(s =>
    s.profile_id === activeProfileId &&
    new Date(s.completed_at || s.started_at) >= weekStart &&
    s.status === 'completed' &&
    s.session_type === 'work'
  );
  const totalHoursWeek = statsWeek.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);

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

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#09090b] text-slate-100' : 'bg-[#f6f6f8] text-slate-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">

        {/* Page Heading & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Buenas tardes, {activeProfile.user_name}
            </h1>
            <div className="flex items-center gap-2 text-slate-400">
              <Timer className="w-4 h-4" />
              <p className="text-sm font-normal">
                Has estudiado <span className="text-indigo-500 font-medium">{totalHoursToday.toFixed(1)}h</span> hoy. ¡Sigue así!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isDark
                ? 'glass-card hover:bg-white/5 text-slate-400'
                : 'glass-card-light hover:bg-slate-100 text-slate-500'
            }`}>
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 h-10 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02]">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </button>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {/* Stat: Pomodoros Hoy */}
          <div className={`p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl neon-glow transition-all ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">HOY</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-500">{statsToday.length}</p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">pomodoros</p>
            {/* Progress bar */}
            <div className={`h-1 w-full rounded-full mt-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min((statsToday.length / 8) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Stat: Horas Semana */}
          <div className={`p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl neon-glow transition-all ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">SEMANA</span>
            </div>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {totalHoursWeek.toFixed(1)}h
            </p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">de estudio</p>
          </div>

          {/* Stat: Materias Activas */}
          <div className={`p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl neon-glow transition-all ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">MATERIAS</span>
            </div>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {activeSubjects.length}
            </p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">activas</p>
          </div>

          {/* Stat: Tareas Pendientes */}
          <div className={`p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl neon-glow transition-all ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">PENDIENTE</span>
            </div>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {upcomingTasks.length}
            </p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">tareas</p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className={`text-lg md:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Materias Activas
            </h2>
            <button className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium">
              Ver todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {activeSubjects.length === 0 ? (
              <div className={`col-span-full p-8 md:p-12 rounded-xl md:rounded-2xl text-center ${
                isDark ? 'glass-card' : 'glass-card-light'
              }`}>
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-400 font-medium mb-2">No tienes materias aún</p>
                <p className="text-sm text-slate-500">Agrega tu primera materia para empezar</p>
              </div>
            ) : (
              activeSubjects.map(subject => {
                const subjectTasks = (tasks || []).filter(t => t.subject_id === subject.id);
                const completedTasks = subjectTasks.filter(t => t.status === 'completed').length;
                const progress = subjectTasks.length > 0 ? (completedTasks / subjectTasks.length) * 100 : 0;

                return (
                  <div key={subject.id} className={`p-4 md:p-5 rounded-xl md:rounded-2xl flex flex-col gap-3 md:gap-4 neon-glow transition-all duration-300 ${
                    isDark ? 'glass-card' : 'glass-card-light'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${subject.color}15`,
                          border: `1px solid ${subject.color}30`
                        }}
                      >
                        <GraduationCap className="w-5 h-5 md:w-6 md:h-6" style={{ color: subject.color }} />
                      </div>
                      <button className="text-slate-500 hover:text-slate-300 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h3 className={`text-base md:text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-400">{subject.code || 'Sin código'}</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progreso</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{Math.round(progress)}%</span>
                      </div>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: subject.color,
                            boxShadow: `0 0 10px ${subject.color}50`
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-xs text-slate-500">{subjectTasks.length} tareas</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
          {/* Upcoming Tasks List */}
          <div className={`lg:col-span-2 p-4 md:p-6 rounded-xl md:rounded-2xl ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base md:text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Próximas Tareas
              </h3>
              <button className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                <span className="text-xl">+</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              {upcomingTasks.length === 0 ? (
                <div className={`py-8 md:py-12 text-center rounded-lg border-2 border-dashed ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <Trophy className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-indigo-500" />
                  <p className="text-slate-400 font-medium">¡Todo al día!</p>
                  <p className="text-sm text-slate-500 mt-1">No tienes tareas pendientes</p>
                </div>
              ) : (
                upcomingTasks.map(task => {
                  const subj = subjects.find(s => s.id === task.subject_id);
                  return (
                    <div key={task.id} className={`flex items-center gap-3 p-3 md:p-4 rounded-lg md:rounded-xl transition-colors group cursor-pointer border ${
                      isDark
                        ? 'hover:bg-white/5 border-transparent hover:border-white/5'
                        : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isDark
                          ? 'border-slate-600 group-hover:border-indigo-500'
                          : 'border-slate-300 group-hover:border-indigo-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {subj?.name} • {format(new Date(task.due_date), "d MMM", { locale: es })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'urgent' || task.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : task.priority === 'medium'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : isDark
                          ? 'bg-slate-700/50 text-slate-400 border border-slate-600/20'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Focus Streak & Mini Pomodoro */}
          <div className={`p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col gap-4 md:gap-6 ${
            isDark ? 'glass-card' : 'glass-card-light'
          }`}>
            {/* Focus Streak */}
            <div>
              <h3 className={`text-base md:text-lg font-semibold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Racha de Enfoque
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {statsWeek.length}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-1">Sesiones</div>
                </div>
                <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div className="flex flex-col items-center">
                  <div className="text-xl md:text-2xl font-bold text-indigo-500">
                    {Math.round((statsToday.length / 8) * 100)}%
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-1">Meta Hoy</div>
                </div>
                <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div className="flex flex-col items-center">
                  <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {totalHoursWeek.toFixed(0)}h
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-1">Total</div>
                </div>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className={`pt-4 md:pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Meta Diaria</h4>
                <span className="text-xs text-slate-400">{statsToday.length} / 8</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((statsToday.length / 8) * 100, 100)}%`,
                    boxShadow: '0 0 10px rgba(99,102,241,0.5)'
                  }}
                />
              </div>
            </div>

            {/* Mini Pomodoro Widget */}
            <div className={`pt-4 md:pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <MiniPomodoro
                duration={workDuration}
                theme={theme}
                compact={true}
                onComplete={handleMiniPomodoroComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
