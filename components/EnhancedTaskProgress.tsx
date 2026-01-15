import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  CheckCircle2, Circle, Clock, Flame, TrendingUp,
  Award, Target, Zap, Calendar, AlertCircle
} from 'lucide-react';
import { format, differenceInDays, isBefore, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

const EnhancedTaskProgress: React.FC = () => {
  const { theme, activeProfileId, tasks, subjects } = useAppStore();

  const activeTasks = useMemo(() =>
    tasks.filter(t => {
      const subject = subjects.find(s => s.id === t.subject_id);
      return subject?.profile_id === activeProfileId;
    }),
    [tasks, subjects, activeProfileId]
  );

  const stats = useMemo(() => {
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'completed').length;
    const inProgress = activeTasks.filter(t => t.status === 'in_progress').length;
    const pending = activeTasks.filter(t => t.status === 'pending').length;
    const urgent = activeTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
    const overdue = activeTasks.filter(t =>
      t.status !== 'completed' && isBefore(new Date(t.due_date), new Date())
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, pending, urgent, overdue, completionRate };
  }, [activeTasks]);

  const tasksBySubject = useMemo(() => {
    const grouped: Record<string, typeof activeTasks> = {};

    activeTasks.forEach(task => {
      if (!grouped[task.subject_id]) {
        grouped[task.subject_id] = [];
      }
      grouped[task.subject_id].push(task);
    });

    return grouped;
  }, [activeTasks]);

  const upcomingTasks = useMemo(() =>
    activeTasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 10),
    [activeTasks]
  );

  const getUrgencyLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return { label: 'Hoy', color: 'bg-red-500', textColor: 'text-red-500' };
    if (isTomorrow(date)) return { label: 'Mañana', color: 'bg-orange-500', textColor: 'text-orange-500' };

    const days = differenceInDays(date, new Date());
    if (days < 0) return { label: 'Vencida', color: 'bg-red-600', textColor: 'text-red-600' };
    if (days <= 3) return { label: `${days}d`, color: 'bg-orange-400', textColor: 'text-orange-400' };
    if (days <= 7) return { label: `${days}d`, color: 'bg-yellow-400', textColor: 'text-yellow-400' };

    return { label: format(date, 'd MMM', { locale: es }), color: 'bg-green-400', textColor: 'text-green-400' };
  };

  return (
    <div className={`space-y-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {/* Total Tasks */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
          <Target className="text-indigo-500 mb-3" size={24} />
          <p className="text-4xl font-black mb-1">{stats.total}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total</p>
        </div>

        {/* Completed */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
          <CheckCircle2 className="text-green-500 mb-3" size={24} />
          <p className="text-4xl font-black mb-1">{stats.completed}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Completas</p>
        </div>

        {/* In Progress */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <Flame className="text-blue-500 mb-3 animate-pulse" size={24} />
          <p className="text-4xl font-black mb-1">{stats.inProgress}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">En Curso</p>
        </div>

        {/* Pending */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
          <Circle className="text-yellow-500 mb-3" size={24} />
          <p className="text-4xl font-black mb-1">{stats.pending}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pendientes</p>
        </div>

        {/* Urgent */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
          <AlertCircle className="text-red-500 mb-3" size={24} />
          <p className="text-4xl font-black mb-1">{stats.urgent}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Urgentes</p>
        </div>

        {/* Completion Rate */}
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg transition-all hover:scale-105 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <Award className="text-purple-500 mb-3" size={24} />
          <p className="text-4xl font-black mb-1">{stats.completionRate.toFixed(0)}%</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Logro</p>
        </div>
      </div>

      {/* Progress Bar Global */}
      <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black mb-2">Progreso General</h2>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {stats.completed} de {stats.total} tareas completadas
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {stats.completionRate.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative h-8 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 flex items-center justify-end px-4"
            style={{ width: `${stats.completionRate}%` }}
          >
            {stats.completionRate > 15 && (
              <span className="text-white font-black text-sm drop-shadow-lg">
                {stats.completionRate.toFixed(0)}%
              </span>
            )}
            <div className="absolute inset-0 shimmer opacity-30" />
          </div>
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between mt-4 px-2">
          {[25, 50, 75, 100].map(milestone => (
            <div key={milestone} className="text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                stats.completionRate >= milestone
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`} />
              <span className="text-xs font-bold text-slate-400">{milestone}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress by Subject */}
      <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
          <TrendingUp className="text-indigo-500" size={32} />
          Progreso por Materia
        </h2>

        <div className="space-y-6">
          {Object.entries(tasksBySubject).map(([subjectId, subjectTasks]) => {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) return null;

            const total = subjectTasks.length;
            const completed = subjectTasks.filter(t => t.status === 'completed').length;
            const percentage = (completed / total) * 100;

            return (
              <div key={subjectId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <h3 className="font-black text-lg">{subject.name}</h3>
                      <p className="text-sm font-bold text-slate-400">
                        {completed}/{total} tareas
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-black" style={{ color: subject.color }}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="relative h-4 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)`
                    }}
                  >
                    <div className="absolute inset-0 shimmer opacity-20" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks Timeline */}
      <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
          <Calendar className="text-purple-500" size={32} />
          Próximas Tareas
        </h2>

        <div className="space-y-4">
          {upcomingTasks.map((task, idx) => {
            const subject = subjects.find(s => s.id === task.subject_id);
            const urgency = getUrgencyLabel(task.due_date);

            return (
              <div
                key={task.id}
                className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                }`}
              >
                {/* Timeline connector */}
                {idx < upcomingTasks.length - 1 && (
                  <div className={`absolute left-6 bottom-0 w-0.5 h-4 translate-y-full ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                  }`} />
                )}

                <div className="flex items-start gap-4">
                  {/* Urgency Badge */}
                  <div className="flex-shrink-0">
                    <div className={`px-4 py-2 rounded-xl ${urgency.color} text-white font-black text-sm min-w-[80px] text-center`}>
                      {urgency.label}
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-black text-lg group-hover:text-indigo-500 transition-colors">
                        {task.title}
                      </h3>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                        task.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-500'
                          : task.priority === 'high'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      {subject && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-xs font-bold text-slate-400">{subject.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Clock size={12} />
                        {format(new Date(task.due_date), "d 'de' MMM", { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {upcomingTasks.length === 0 && (
            <div className="py-20 text-center">
              <Award className="mx-auto mb-4 text-indigo-500" size={64} />
              <p className="text-2xl font-black text-slate-400 mb-2">¡Excelente trabajo!</p>
              <p className="text-slate-500 font-medium">No tienes tareas pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskProgress;
