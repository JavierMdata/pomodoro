
import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Zap, Calendar, Star, TrendingUp } from 'lucide-react';

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
      let cat = 'General';
      if (s.task_id) {
        const task = tasks.find(t => t.id === s.task_id);
        cat = task?.title || 'Tarea';
      } else if (s.material_id) {
        const mat = materials.find(m => m.id === s.material_id);
        cat = mat?.title || 'Material';
      }
      cats[cat] = (cats[cat] || 0) + (s.duration_seconds / 3600);
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [profileSessions, tasks, materials]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className={`max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
          <TrendingUp size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Estadísticas de Rendimiento</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Visualiza tu evolución y optimiza tus sesiones.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tiempo Total', value: `${stats.totalHours}h`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Pomodoros', value: stats.totalPomodoros, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Días Activos', value: stats.activeDays, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Nivel Enfoque', value: `${stats.avgFocus}/5`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-4xl font-black mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Bar Chart */}
        <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-xl font-black mb-8">Horas de Estudio (Últimos 7 días)</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#6366f1' }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-xl font-black mb-8">Distribución por Ítem</h3>
          <div className="h-[300px] w-full flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="w-full h-full max-w-[250px] relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryData.length ? categoryData : [{ name: 'Sin datos', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                    {categoryData.length === 0 && <Cell fill={theme === 'dark' ? '#334155' : '#f1f5f9'} stroke="none" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 min-w-[140px]">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="flex flex-col">
                    <span className="text-xs font-black truncate max-w-[120px]">{entry.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{entry.value}h</span>
                  </div>
                </div>
              ))}
              {categoryData.length === 0 && <p className="text-xs text-slate-400 italic">No hay datos suficientes</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
