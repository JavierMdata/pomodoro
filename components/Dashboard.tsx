
import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  Bell, Calendar, Clock, AlertCircle, ChevronRight, 
  CheckCircle2, BookOpen, GraduationCap, Sparkles
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { 
    theme, activeProfileId, profiles, subjects, schedules, 
    tasks, exams, alerts, markAlertRead, sessions 
  } = useAppStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  if (!activeProfile) return null;

  const today = new Date();
  const dayOfWeek = today.getDay(); 

  const todayClasses = schedules.filter(s => {
    const subj = subjects.find(sub => sub.id === s.subject_id);
    return subj?.profile_id === activeProfileId && s.day_of_week === dayOfWeek;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const unreadAlerts = alerts.filter(a => a.profile_id === activeProfileId && !a.is_read);

  const upcomingTasks = tasks.filter(t => {
      const subj = subjects.find(s => s.id === t.subject_id);
      return subj?.profile_id === activeProfileId && t.status !== 'completed';
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 3);

  const statsToday = sessions.filter(s => 
    s.profile_id === activeProfileId && 
    isSameDay(new Date(s.completed_at || s.started_at), today) && 
    s.status === 'completed'
  );

  const totalHoursToday = statsToday.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);

  return (
    <div className={`max-w-6xl mx-auto space-y-10 pb-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-indigo-500" size={24} />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Panel de Control</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-4">Hola, {activeProfile.user_name}</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium text-lg`}>
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        
        <div className={`flex items-center gap-6 p-6 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-right duration-700 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`text-center pr-6 border-r ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <p className="text-3xl font-black text-indigo-500">{statsToday.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Pomodoros</p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{totalHoursToday.toFixed(1)}h</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Horas Hoy</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
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

          <section className={`p-10 rounded-[3.5rem] border shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-3xl ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Calendar size={28} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Clases de Hoy</h3>
              </div>
            </div>

            <div className="space-y-8">
              {todayClasses.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-medium text-lg italic">Sin clases programadas para hoy. ✨</p>
                </div>
              ) : (
                todayClasses.map(cls => {
                  const subj = subjects.find(s => s.id === cls.subject_id);
                  return (
                    <div key={cls.id} className="flex gap-8 group">
                      <div className="w-24 text-right pt-2">
                        <p className={`text-xl font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{cls.start_time}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cls.end_time}</p>
                      </div>
                      <div className={`relative flex-1 rounded-[2rem] p-6 transition-all border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 group-hover:bg-slate-700' : 'bg-slate-50 border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100'}`}>
                        <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-full" style={{ backgroundColor: subj?.color || '#3B82F6' }} />
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-black mb-1">{subj?.name}</h4>
                            <div className={`flex items-center gap-3 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                <span className="flex items-center gap-1"><Clock size={14} /> {cls.start_time}-{cls.end_time}</span>
                                <span className="flex items-center gap-1"><GraduationCap size={14} /> {subj?.classroom || 'Aula TBD'}</span>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className={`p-10 rounded-[3.5rem] border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight">
              <Clock className="text-orange-500" />
              Próximas Metas
            </h3>
            <div className="space-y-5">
              {upcomingTasks.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
                  <p className="text-slate-400 text-sm font-bold">¡Día libre!</p>
                </div>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${theme === 'dark' ? 'border-slate-700 bg-slate-700/20 hover:bg-slate-700/50' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                        task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {task.priority}
                      </span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(task.due_date), "d MMM", { locale: es })}</p>
                    </div>
                    <h4 className="font-bold text-base truncate group-hover:text-indigo-500 transition-colors">{task.title}</h4>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <BookOpen size={160} />
            </div>
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-indigo-200">Meta Diaria</h3>
            <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black">{statsToday.length}</span>
                  <span className="text-2xl font-bold opacity-50">/ 8 poms</span>
                </div>
                <p className="text-sm text-indigo-100 font-medium mt-3 leading-relaxed">
                  Has completado el {Math.round((statsToday.length / 8) * 100)}% de tu objetivo de enfoque de hoy.
                </p>
            </div>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.min((statsToday.length / 8) * 100, 100)}%` }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
