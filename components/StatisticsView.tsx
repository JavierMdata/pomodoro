
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Zap, Calendar, Star, TrendingUp, Sparkles, BrainCircuit, Loader2, ChevronDown, ChevronRight, Timer, Target, Flame } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const StatisticsView: React.FC = () => {
  const { theme, activeProfileId, profiles, sessions, tasks, materials, examTopics, subjects } = useAppStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const profileSessions = useMemo(() =>
    sessions.filter(s => s.profile_id === activeProfileId && s.status === 'completed'),
    [sessions, activeProfileId]
  );

  const stats = useMemo(() => {
    const totalMinutes = profileSessions.reduce((acc, s) => acc + (s.duration_seconds / 60), 0);
    const avgFocus = profileSessions.length ? profileSessions.reduce((acc, s) => acc + (s.focus_rating || 0), 0) / profileSessions.length : 0;
    const activeDays = new Set(profileSessions.map(s => startOfDay(new Date(s.completed_at || s.started_at)).toISOString())).size;

    // Calculate streak
    let streak = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const hasSessions = profileSessions.some(s =>
        isSameDay(new Date(s.completed_at || s.started_at), day)
      );
      if (hasSessions) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalPomodoros: profileSessions.length,
      activeDays,
      avgFocus: avgFocus.toFixed(1),
      streak
    };
  }, [profileSessions]);

  const toggleDay = (dayKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) newExpanded.delete(dayKey);
    else newExpanded.add(dayKey);
    setExpandedDays(newExpanded);
  };

  // Weekly heatmap data (last 4 weeks)
  const heatmapData = useMemo(() => {
    const last28Days = eachDayOfInterval({
      start: subDays(new Date(), 27),
      end: new Date()
    });

    return last28Days.map(day => {
      const daySessions = profileSessions.filter(s =>
        isSameDay(new Date(s.completed_at || s.started_at), day)
      );
      const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration_seconds / 60), 0);
      return {
        date: day,
        dayLabel: format(day, 'EEE', { locale: es }),
        dayNum: format(day, 'd'),
        sessions: daySessions.length,
        minutes: Math.round(totalMinutes),
        intensity: totalMinutes === 0 ? 0 : totalMinutes < 30 ? 1 : totalMinutes < 60 ? 2 : totalMinutes < 120 ? 3 : 4
      };
    });
  }, [profileSessions]);

  // Daily detailed data
  const dailyDetailedData = useMemo(() => {
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    });

    return last14Days.map(day => {
      const daySessions = profileSessions.filter(s =>
        isSameDay(new Date(s.completed_at || s.started_at), day)
      );

      const sessionsWithDetails = daySessions.map(s => {
        let itemTitle = 'Estudio General';
        let itemType = 'general';
        let subjectName = '';

        if (s.task_id) {
          const task = tasks.find(t => t.id === s.task_id);
          itemTitle = task?.title || 'Tarea';
          itemType = 'task';
          const subject = subjects.find(sub => sub.id === task?.subject_id);
          subjectName = subject?.name || '';
        } else if (s.exam_topic_id) {
          const topic = examTopics.find(t => t.id === s.exam_topic_id);
          itemTitle = topic?.title || 'Tema de Examen';
          itemType = 'topic';
        } else if (s.material_id) {
          const material = materials.find(m => m.id === s.material_id);
          itemTitle = material?.title || 'Material';
          itemType = 'material';
          const subject = subjects.find(sub => sub.id === material?.subject_id);
          subjectName = subject?.name || '';
        }

        return {
          ...s,
          itemTitle,
          itemType,
          subjectName,
          duration: (s.duration_seconds / 60).toFixed(0)
        };
      });

      const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration_seconds / 60), 0);

      return {
        date: day,
        dateFormatted: format(day, "EEEE d 'de' MMMM", { locale: es }),
        dateShort: format(day, 'eee d', { locale: es }),
        dayKey: format(day, 'yyyy-MM-dd'),
        sessions: sessionsWithDetails,
        totalSessions: daySessions.length,
        totalHours: (totalMinutes / 60).toFixed(1),
        avgFocus: daySessions.length ? (daySessions.reduce((acc, s) => acc + (s.focus_rating || 0), 0) / daySessions.length).toFixed(1) : '0'
      };
    }).filter(d => d.totalSessions > 0);
  }, [profileSessions, tasks, materials, examTopics, subjects]);

  const generateAiInsight = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setAiInsight("Por favor, configura la variable 'API_KEY' en Vercel para activar el análisis inteligente.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });

      const topItems = (Object.entries(
        profileSessions.reduce((acc: Record<string, number>, s) => {
          const name = s.task_id ? tasks.find(t => t.id === s.task_id)?.title :
                       s.material_id ? materials.find(m => m.id === s.material_id)?.title : 'General';
          if (name) acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(i => i[0]).join(", ");

      const prompt = `Actúa como un mentor de productividad de élite. Analiza este perfil académico:
      - Usuario: ${activeProfile?.user_name} (${activeProfile?.type})
      - Género: ${activeProfile?.gender}
      - Horas trabajadas: ${stats.totalHours}h en ${stats.totalPomodoros} sesiones.
      - Enfoque promedio: ${stats.avgFocus}/5.
      - Racha actual: ${stats.streak} días.
      - Temas principales: ${topItems || "Varios"}.

      Instrucciones:
      1. Da un diagnóstico de su estado actual.
      2. Proporciona un consejo accionable basado en sus datos.
      3. Mantén un tono motivador pero firme, adecuado a su género (${activeProfile?.gender}).
      Máximo 60 palabras.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsight(response.text || "Tu rendimiento es sólido, sigue así.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiInsight("Error al procesar el análisis. Verifica que tu API_KEY sea válida.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Chart data - last 7 days with area chart
  const dailyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const daySessions = profileSessions.filter(s => isSameDay(new Date(s.completed_at || s.started_at), day));
      const hours = daySessions.reduce((acc, s) => acc + (s.duration_seconds / 3600), 0);
      const avgFocus = daySessions.length ? daySessions.reduce((acc, s) => acc + (s.focus_rating || 0), 0) / daySessions.length : 0;
      return {
        date: format(day, 'EEE', { locale: es }),
        hours: parseFloat(hours.toFixed(1)),
        sessions: daySessions.length,
        focus: parseFloat(avgFocus.toFixed(1))
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
      } else if (s.exam_topic_id) {
        const topic = examTopics.find(t => t.id === s.exam_topic_id);
        cat = topic?.title || 'Examen';
      }
      cats[cat] = (cats[cat] || 0) + (s.duration_seconds / 3600);
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [profileSessions, tasks, materials, examTopics]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getHeatmapColor = (intensity: number) => {
    if (theme === 'dark') {
      switch (intensity) {
        case 0: return 'bg-slate-800';
        case 1: return 'bg-indigo-900/60';
        case 2: return 'bg-indigo-700/70';
        case 3: return 'bg-indigo-500/80';
        case 4: return 'bg-indigo-400';
        default: return 'bg-slate-800';
      }
    } else {
      switch (intensity) {
        case 0: return 'bg-slate-100';
        case 1: return 'bg-indigo-100';
        case 2: return 'bg-indigo-200';
        case 3: return 'bg-indigo-400';
        case 4: return 'bg-indigo-600';
        default: return 'bg-slate-100';
      }
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch(type) {
      case 'task': return '📝';
      case 'topic': return '🎯';
      case 'material': return '📚';
      default: return '✨';
    }
  };

  const getItemTypeColor = (type: string) => {
    switch(type) {
      case 'task': return 'text-blue-500 bg-blue-500/10';
      case 'topic': return 'text-purple-500 bg-purple-500/10';
      case 'material': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-12 px-3 sm:px-4 md:px-0 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Estadísticas
            </h1>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              {activeProfile && (
                <span className="inline-flex items-center gap-1.5 mr-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProfile.color }}></span>
                  {activeProfile.name} -
                </span>
              )}
              Tu evolución de estudio
            </p>
          </div>
        </div>

        <button
          onClick={generateAiInsight}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
          Análisis IA
        </button>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div className={`p-5 sm:p-6 rounded-2xl border border-dashed border-indigo-500/30 animate-in slide-in-from-top duration-500 relative overflow-hidden ${
          theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-50'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] mb-1">Coach IA</h4>
              <p className={`text-sm font-bold leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                "{aiInsight}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Tiempo Total', value: `${stats.totalHours}h`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Pomodoros', value: stats.totalPomodoros, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Días Activos', value: stats.activeDays, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Enfoque', value: `${stats.avgFocus}/5`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Racha', value: `${stats.streak}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all overflow-hidden ${
            theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-0.5">{stat.value}</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${
        theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className="text-sm sm:text-base font-black mb-4">Actividad (Últimos 28 días)</h3>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1">
              {day}
            </div>
          ))}
          {heatmapData.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-sm sm:rounded-md ${getHeatmapColor(day.intensity)} transition-all hover:scale-110 cursor-default relative group`}
              title={`${format(day.date, 'd MMM', { locale: es })}: ${day.minutes}min, ${day.sessions} sesiones`}
            >
              <span className="text-[8px] sm:text-[9px] font-bold absolute inset-0 flex items-center justify-center opacity-60">
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[9px] font-bold text-slate-400">Menos</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`w-3 h-3 rounded-sm ${getHeatmapColor(i)}`} />
          ))}
          <span className="text-[9px] font-bold text-slate-400">Más</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Study Hours Chart */}
        <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-sm sm:text-base font-black mb-4 sm:mb-6">Horas de Estudio (7 días)</h3>
          <div className="h-[200px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ stroke: theme === 'dark' ? '#4f46e5' : '#c7d2fe', strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 12px'
                  }}
                  formatter={(value: any, name: string) => {
                    const labels: Record<string, string> = { hours: 'Horas', sessions: 'Sesiones', focus: 'Enfoque' };
                    return [value, labels[name] || name];
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
                <Bar dataKey="sessions" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution */}
        <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-sm sm:text-base font-black mb-4 sm:mb-6">Distribución</h3>
          <div className="h-[200px] sm:h-[250px] w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="w-full h-full max-w-[180px] sm:max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryData.length ? categoryData : [{ name: 'Sin datos', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                    {categoryData.length === 0 && <Cell fill={theme === 'dark' ? '#334155' : '#f1f5f9'} stroke="none" />}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-row sm:flex-col flex-wrap gap-2 sm:gap-2.5 justify-center">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div>
                    <span className="text-[11px] font-black truncate block max-w-[100px]">{entry.name}</span>
                    <span className="text-[9px] font-bold text-slate-400">{entry.value}h</span>
                  </div>
                </div>
              ))}
              {categoryData.length === 0 && <p className="text-xs text-slate-400 italic">No hay datos</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Daily History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="text-indigo-500" size={20} />
          <h2 className="text-lg sm:text-xl font-black tracking-tight">Historial Detallado</h2>
        </div>

        {dailyDetailedData.length === 0 ? (
          <div className={`p-8 sm:p-10 text-center rounded-xl sm:rounded-2xl border-2 border-dashed ${
            theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
          }`}>
            <Calendar size={40} className="mx-auto mb-3 text-slate-400" />
            <h3 className="text-base font-black text-slate-400 mb-1">No hay sesiones registradas</h3>
            <p className="text-xs text-slate-500">Completa tu primer Pomodoro para ver estadísticas.</p>
          </div>
        ) : (
          dailyDetailedData.map((day) => {
            const isExpanded = expandedDays.has(day.dayKey);

            return (
              <div
                key={day.dayKey}
                className={`rounded-xl sm:rounded-2xl border overflow-hidden transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <button
                  onClick={() => toggleDay(day.dayKey)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                      <Calendar className="text-indigo-500" size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-black capitalize truncate">{day.dateFormatted}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                          {day.totalSessions} sesiones
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                          {day.totalHours}h
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                          Enfoque: {day.avgFocus}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180 bg-indigo-500/10' : 'bg-slate-500/10'}`}>
                    <ChevronDown size={16} className={isExpanded ? 'text-indigo-500' : ''} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top duration-300">
                    <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} mb-3`} />
                    {day.sessions.map((session, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-700/40 hover:bg-slate-700/60'
                            : 'bg-slate-50 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className={`text-lg p-1.5 rounded-lg ${getItemTypeColor(session.itemType)}`}>
                          {getItemTypeIcon(session.itemType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xs sm:text-sm truncate">{session.itemTitle}</h4>
                          {session.subjectName && (
                            <p className="text-[10px] text-slate-500 font-bold">{session.subjectName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                            <Timer size={11} className="text-indigo-500" />
                            <span className="text-[10px] font-black">{session.duration}m</span>
                          </div>
                          {session.focus_rating && session.focus_rating > 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                              <Star size={11} className="text-yellow-500" fill="currentColor" />
                              <span className="text-[10px] font-black">{session.focus_rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
