import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Brain, Sparkles, Calendar, Clock, Target, TrendingUp,
  Zap, BookOpen, RefreshCw, CheckCircle2, Flame, Award,
  Play, ChevronRight, AlertCircle
} from 'lucide-react';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniPomodoro from './MiniPomodoro';
import {
  generateStudyPlanWithAI,
  generateBasicStudyPlan,
  StudyPlan,
  StudySession
} from '../services/aiStudyPlanner';

const AIStudyPlanner: React.FC = () => {
  const {
    theme,
    activeProfileId,
    subjects,
    exams,
    examTopics,
    schedules,
    sessions,
    addSession
  } = useAppStore();

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Filtrar datos por perfil activo
  const activeSubjects = useMemo(() =>
    subjects.filter(s => s.profile_id === activeProfileId),
    [subjects, activeProfileId]
  );

  const activeExams = useMemo(() =>
    exams.filter(e => {
      const subject = subjects.find(s => s.id === e.subject_id);
      return subject?.profile_id === activeProfileId;
    }),
    [exams, subjects, activeProfileId]
  );

  const activeTopics = useMemo(() =>
    examTopics.filter(t => {
      const exam = exams.find(e => e.id === t.exam_id);
      const subject = subjects.find(s => s.id === exam?.subject_id);
      return subject?.profile_id === activeProfileId;
    }),
    [examTopics, exams, subjects, activeProfileId]
  );

  const activeSchedules = useMemo(() => {
    const filtered = schedules.filter(sch => {
      const subject = subjects.find(s => s.id === sch.subject_id);
      return subject?.profile_id === activeProfileId;
    });

    console.log('🧠 AIStudyPlanner - Schedules Debug:', {
      totalSchedules: schedules.length,
      filteredSchedules: filtered.length,
      activeProfileId
    });

    return filtered;
  }, [schedules, subjects, activeProfileId]);

  const generatePlan = async (useAI: boolean = true) => {
    console.log('🤖 Generando plan de estudio con IA:', {
      subjects: activeSubjects.length,
      exams: activeExams.length,
      topics: activeTopics.length,
      schedules: activeSchedules.length,
      useAI
    });

    setIsGenerating(true);
    try {
      let plan: StudyPlan | null = null;

      if (useAI) {
        console.log('🔑 Intentando usar Gemini AI...');
        // Intenta usar IA automáticamente con API key de entorno
        plan = await generateStudyPlanWithAI(
          activeSubjects,
          activeExams,
          activeTopics,
          activeSchedules
        );
      }

      if (!plan) {
        console.log('⚠️ IA no generó plan, usando plan básico');
        // Fallback al plan básico
        plan = generateBasicStudyPlan(activeSubjects, activeExams, activeTopics, activeSchedules);
      } else {
        console.log('✅ Plan generado con IA exitosamente:', {
          totalSessions: plan.sessions.length,
          daysSpan: plan.sessions.length > 0 ?
            Math.ceil((new Date(plan.sessions[plan.sessions.length - 1].date).getTime() - new Date(plan.sessions[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0
        });
      }

      console.log('📊 Plan final:', plan);
      setStudyPlan(plan);
    } catch (error) {
      console.error('❌ Error generando plan:', error);
      // Si falla, usar plan básico
      const basicPlan = generateBasicStudyPlan(activeSubjects, activeExams, activeTopics, activeSchedules);
      console.log('🔄 Usando plan básico de fallback:', basicPlan);
      setStudyPlan(basicPlan);
    } finally {
      setIsGenerating(false);
    }
  };

  // Agrupar sesiones por día
  const sessionsByDay = useMemo(() => {
    if (!studyPlan) return {};

    const grouped: Record<string, StudySession[]> = {};
    studyPlan.sessions.forEach(session => {
      if (!grouped[session.scheduled_date]) {
        grouped[session.scheduled_date] = [];
      }
      grouped[session.scheduled_date].push(session);
    });

    return grouped;
  }, [studyPlan]);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessionsByDay[today] || [];

  const getTechniqueInfo = (technique: string) => {
    const info = {
      pomodoro: { label: 'Pomodoro', icon: Flame, color: '#EF4444', bgColor: 'bg-red-500/10' },
      'deep-focus': { label: 'Enfoque Profundo', icon: Target, color: '#8B5CF6', bgColor: 'bg-purple-500/10' },
      'active-recall': { label: 'Recuperación Activa', icon: Brain, color: '#EC4899', bgColor: 'bg-pink-500/10' },
      feynman: { label: 'Técnica Feynman', icon: Sparkles, color: '#06B6D4', bgColor: 'bg-cyan-500/10' },
      interleaving: { label: 'Intercalado', icon: TrendingUp, color: '#F59E0B', bgColor: 'bg-amber-500/10' },
      revision: { label: 'Repaso Espaciado', icon: RefreshCw, color: '#10B981', bgColor: 'bg-green-500/10' },
      practice: { label: 'Práctica Deliberada', icon: BookOpen, color: '#F97316', bgColor: 'bg-orange-500/10' }
    };
    return info[technique as keyof typeof info] || info.pomodoro;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const startStudySession = (session: StudySession) => {
    if (!activeProfileId) return;

    // Crear sesión de Pomodoro
    addSession({
      profile_id: activeProfileId,
      exam_topic_id: session.topic_id,
      session_type: 'work',
      planned_duration_minutes: session.duration_minutes,
      duration_seconds: 0,
      status: 'pending',
      started_at: new Date().toISOString()
    });

    // TODO: Navegar al temporizador
  };

  if (!activeProfileId) return null;

  return (
    <div className={`max-w-7xl mx-auto space-y-8 pb-12 relative ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Mini Pomodoro Widget */}
      <div className="fixed bottom-8 right-8 z-30">
        <MiniPomodoro duration={25} theme={theme} compact={false} />
      </div>

      {/* Header con IA */}
      <div className="relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-purple-300/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Brain size={36} className="animate-pulse" />
                <h1 className="text-5xl font-black tracking-tight">Plan de Estudio IA</h1>
              </div>
              <p className="text-indigo-100 text-lg font-bold max-w-2xl">
                Optimiza tu aprendizaje con repetición espaciada y estrategias personalizadas por inteligencia artificial.
              </p>
            </div>

            <button
              onClick={() => generatePlan(true)}
              disabled={isGenerating}
              className="px-8 py-5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  Generando Plan Inteligente...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generar Plan con IA
                </>
              )}
            </button>
          </div>

          {studyPlan && (
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-yellow-300" />
                <h3 className="font-black text-sm uppercase tracking-widest">Estrategia IA</h3>
              </div>
              <p className="text-white/90 font-medium leading-relaxed">{studyPlan.ai_strategy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {studyPlan && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <Calendar className="text-indigo-500" size={24} />
              <span className="text-3xl font-black">{Object.keys(sessionsByDay).length}</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Días programados</p>
          </div>

          <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="text-purple-500" size={24} />
              <span className="text-3xl font-black">{studyPlan.sessions.length}</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sesiones totales</p>
          </div>

          <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <Clock className="text-orange-500" size={24} />
              <span className="text-3xl font-black">{studyPlan.total_study_hours.toFixed(0)}h</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Horas de estudio</p>
          </div>

          <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <Award className="text-green-500" size={24} />
              <span className="text-3xl font-black">{todaySessions.length}</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sesiones hoy</p>
          </div>
        </div>
      )}

      {/* Sesiones de Hoy */}
      {todaySessions.length > 0 && (
        <section className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Flame size={24} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Sesiones de Hoy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todaySessions.map((session, idx) => {
              const subject = activeSubjects.find(s => s.id === session.subject_id);
              const topic = activeTopics.find(t => t.id === session.topic_id);
              const techniqueInfo = getTechniqueInfo(session.study_technique);
              const TechniqueIcon = techniqueInfo.icon;

              return (
                <div
                  key={session.id}
                  className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-xl'
                  }`}
                >
                  {/* Priority indicator */}
                  <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${getPriorityColor(session.priority)} animate-pulse`} />

                  {/* Session number badge */}
                  <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black">
                    Sesión #{session.session_number}
                  </div>

                  <div className="mt-8 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: subject?.color || '#6366F1' }} />
                      <h3 className="font-black text-lg">{subject?.name}</h3>
                    </div>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {topic?.title || 'Sin tema específico'}
                    </p>
                  </div>

                  {/* Technique */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${techniqueInfo.bgColor} mb-4`}>
                    <TechniqueIcon size={14} style={{ color: techniqueInfo.color }} />
                    <span className="text-xs font-black" style={{ color: techniqueInfo.color }}>
                      {techniqueInfo.label}
                    </span>
                  </div>

                  {/* AI Recommendation */}
                  <p className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {session.ai_recommendation}
                  </p>

                  {/* Time and duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {session.scheduled_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {session.duration_minutes} min
                      </span>
                    </div>

                    <button
                      onClick={() => startStudySession(session)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 group-hover:scale-105"
                    >
                      <Play size={16} />
                      Iniciar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Calendario de Sesiones */}
      {studyPlan && Object.keys(sessionsByDay).length > 0 && (
        <section className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3">
            <Calendar className="text-indigo-500" size={32} />
            Calendario de Estudio
          </h2>

          <div className="grid grid-cols-7 gap-4">
            {Object.entries(sessionsByDay)
              .slice(0, 21)
              .map(([date, daySessions]) => {
                const dateObj = new Date(date + 'T00:00:00');
                const isToday = isSameDay(dateObj, new Date());
                const dayNumber = dateObj.getDate();
                const dayName = format(dateObj, 'EEE', { locale: es });

                return (
                  <div
                    key={date}
                    onClick={() => setSelectedDay(date)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isToday
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-xl'
                        : theme === 'dark'
                        ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {dayName}
                      </p>
                      <p className="text-2xl font-black mt-1">{dayNumber}</p>
                    </div>

                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map((session, idx) => {
                        const subject = activeSubjects.find(s => s.id === session.subject_id);
                        return (
                          <div
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-xs font-bold truncate ${
                              isToday ? 'bg-white/20' : theme === 'dark' ? 'bg-slate-600/50' : 'bg-white'
                            }`}
                            style={{
                              borderLeft: `3px solid ${subject?.color || '#6366F1'}`
                            }}
                          >
                            {session.duration_minutes}min
                          </div>
                        );
                      })}
                      {daySessions.length > 3 && (
                        <div className="text-xs font-bold text-center text-slate-400">
                          +{daySessions.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!studyPlan && !isGenerating && (
        <div className={`p-20 rounded-[3rem] border-2 border-dashed text-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <Brain className="mx-auto mb-6 text-slate-400" size={64} />
          <h3 className="text-2xl font-black mb-3 text-slate-400">
            Genera tu plan de estudio personalizado
          </h3>
          <p className={`mb-8 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
            Usa IA para optimizar tu aprendizaje con repetición espaciada
          </p>
          <button
            onClick={() => generatePlan(false)}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all flex items-center gap-3 mx-auto shadow-xl"
          >
            <Zap size={24} />
            Crear Plan Ahora
          </button>
        </div>
      )}
    </div>
  );
};

export default AIStudyPlanner;
