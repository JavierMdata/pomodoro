
import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Zap, Calendar, Star } from 'lucide-react';

const StatisticsView: React.FC = () => {
  const { theme, activeProfileId, sessions, tasks, materials } = useAppStore();
  
  const profileSessions = useMemo(() => 
    sessions.filter(s => s.profile_id === activeProfileId && s.status === 'completed'),
    [sessions, activeProfileId]
  );

  const stats = useMemo(() => {
    const totalMinutes = profileSessions.reduce((acc, s) => acc + (s.duration_seconds / 60), 0);
    const avgFocus = profileSessions.length ? profileSessions.reduce((acc, s) => acc + (s.focus_rating || 0), 0) / profileSessions.length : 0;
    const activeDays = new Set(profileSessions.map(s => startOfDay(new Date(s.completed_at || s.started_at)).toISOString())).size;

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalPomodoros: profileSessions.length,
      activeDays,
      avgFocus: avgFocus.toFixed(1)
    };
  }, [profileSessions]);

  const dailyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const daySessions = profileSessions.filter(s => isSameDay(new Date(s.completed_at || s.started_at), day));
      const hours = daySessions.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);
      return {
        date: format(day, 'eee', { locale: es }),
        hours: parseFloat(hours.toFixed(1))
      };
    });
  }, [profileSessions]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    profileSessions.forEach(s => {
      let cat = 'Sin categoría';
      if (s.task_id) {
        cat = tasks.find(t => t.id === s.task_id)?.description || 'Tarea';
      } else if (s.material_id) {
        cat = materials.find(m => m.id === s.material_id)?.title || 'Material';
      }
      cats[cat] = (cats[cat] || 0) + (s.duration_seconds / 3600);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [profileSessions, tasks, materials]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div>
        <h1 className="text-4xl font-black tracking-tight">Análisis de Progreso</h1>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Tus datos de rendimiento centralizados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Horas', value: `${stats.totalHours}h`, icon: Clock, color: 'text-indigo-500', bg: theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50' },
          { label: 'Pomodoros', value: stats.totalPomodoros, icon: Zap, color: 'text-amber-500', bg: theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50' },
          { label: 'Días Activos', value: stats.activeDays, icon: Calendar, color: 'text-emerald-500', bg: theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Enfoque', value: `${stats.avgFocus}/5`, icon: Star, color: 'text-purple-500', bg: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <h3 className="text-4xl font-black mb-1">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-xl font-bold mb-8">Horas por Día</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-xl font-bold mb-8">Uso del Tiempo</h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length ? categoryData : [{ name: 'Sin datos', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                  {categoryData.length === 0 && <Cell fill={theme === 'dark' ? '#334155' : '#f1f5f9'} stroke="none" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-6 md:mt-0 md:flex-col justify-center min-w-[150px]">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
