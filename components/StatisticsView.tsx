
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Zap, Calendar, Star, TrendingUp, Sparkles, BrainCircuit, Loader2, ChevronDown, ChevronRight, Timer, Target } from 'lucide-react';
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

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalPomodoros: profileSessions.length,
      activeDays,
      avgFocus: avgFocus.toFixed(1)
    };
  }, [profileSessions]);

  const toggleDay = (dayKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  // Datos detallados por día con sesiones
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
    }).filter(d => d.totalSessions > 0); // Solo mostrar días con sesiones
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
      setAiInsight("Error al procesar el análisis. Verifica que tu API_KEY sea válida y tengas cuota disponible.");
    } finally {
      setIsGenerating(false);
    }
  };

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
    <div className={`max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg">
            <TrendingUp size={32} />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Estadísticas
            </h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold mt-1`}>Visualiza tu evolución y optimiza tus sesiones.</p>
          </div>
        </div>

        <button
          onClick={generateAiInsight}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
          Análisis Smart IA
        </button>
      </div>

      {aiInsight && (
        <div className={`p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-500/30 animate-in slide-in-from-top duration-500 relative overflow-hidden ${theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-50'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-black text-indigo-600 uppercase tracking-widest text-xs mb-2">Consejo de tu Coach IA</h4>
              <p className={`text-lg font-bold leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                "{aiInsight}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tiempo Total', value: `${stats.totalHours}h`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Pomodoros', value: stats.totalPomodoros, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Días Activos', value: stats.activeDays, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Nivel Enfoque', value: `${stats.avgFocus}/5`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`relative p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] overflow-hidden card-hover-effect ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 relative z-10`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-4xl font-black mb-1 relative z-10">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
            <div className={`absolute -bottom-4 -right-4 w-32 h-32 ${stat.bg} rounded-full blur-2xl opacity-20`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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

      {/* Detalle Diario de Sesiones */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="text-indigo-500" size={28} />
          <h2 className="text-3xl font-black tracking-tight">Historial Detallado</h2>
        </div>

        {dailyDetailedData.length === 0 ? (
          <div className={`p-12 text-center rounded-[3rem] border-4 border-dashed ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <Calendar size={64} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-black text-slate-400 mb-2">No hay sesiones registradas</h3>
            <p className="text-slate-500">Completa tu primer Pomodoro para ver estadísticas detalladas.</p>
          </div>
        ) : (
          dailyDetailedData.map((day) => {
            const isExpanded = expandedDays.has(day.dayKey);

            return (
              <div
                key={day.dayKey}
                className={`relative rounded-[2.5rem] border-2 overflow-hidden transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <button
                  onClick={() => toggleDay(day.dayKey)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-left group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                      <Calendar className="text-indigo-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black capitalize">{day.dateFormatted}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-slate-500">
                          {day.totalSessions} sesiones • {day.totalHours}h • Enfoque: {day.avgFocus}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-transform ${isExpanded ? 'rotate-180 bg-indigo-500/10' : 'bg-slate-500/10'}`}>
                    {isExpanded ? <ChevronDown size={20} className="text-indigo-500" /> : <ChevronRight size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className={`px-6 pb-6 space-y-3 animate-in slide-in-from-top duration-300`}>
                    <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} mb-4`} />
                    {day.sessions.map((session, idx) => (
                      <div
                        key={idx}
                        className={`group flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 hover:bg-slate-700'
                            : 'bg-slate-50 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className={`text-2xl p-2 rounded-xl ${getItemTypeColor(session.itemType)}`}>
                          {getItemTypeIcon(session.itemType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm truncate">{session.itemTitle}</h4>
                          {session.subjectName && (
                            <p className="text-xs text-slate-500 font-bold">{session.subjectName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                            <Timer size={14} className="text-indigo-500" />
                            <span className="text-xs font-black">{session.duration}min</span>
                          </div>
                          {session.focus_rating && session.focus_rating > 0 && (
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                              <Star size={14} className="text-yellow-500" fill="currentColor" />
                              <span className="text-xs font-black">{session.focus_rating}/5</span>
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
