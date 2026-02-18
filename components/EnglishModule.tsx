/**
 * MÓDULO DE INGLÉS — PomoSmart
 * Seguimiento de práctica de inglés con metodologías específicas:
 *  - Assimil (texto + audio, fases pasiva/activa)
 *  - Busuu (unidades, puntuación, enlace)
 *  - Pronunciación (tipo, foco fonético, autoevaluación)
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { EnglishSession, EnglishSessionType, AssimilPhase } from '../types';
import {
  Languages, Plus, Trash2, Clock, Calendar, ChevronDown,
  BookOpen, Mic, Globe, BarChart3, TrendingUp, Star, Link, X
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ──────────────────────────────────────────────────────────────
// Sub-componente: Formulario de sesión Assimil
// ──────────────────────────────────────────────────────────────
interface AssimilFormData {
  duration_minutes: number;
  session_date: string;
  assimil_lesson: string;
  assimil_phase: AssimilPhase;
  assimil_notes: string;
}

const emptyAssimil = (): AssimilFormData => ({
  duration_minutes: 30,
  session_date: new Date().toISOString().split('T')[0],
  assimil_lesson: '',
  assimil_phase: 'pasiva',
  assimil_notes: '',
});

// ──────────────────────────────────────────────────────────────
// Sub-componente: Formulario de sesión Busuu
// ──────────────────────────────────────────────────────────────
interface BusuuFormData {
  duration_minutes: number;
  session_date: string;
  busuu_unit: string;
  busuu_score: string;
  busuu_link: string;
}

const emptyBusuu = (): BusuuFormData => ({
  duration_minutes: 20,
  session_date: new Date().toISOString().split('T')[0],
  busuu_unit: '',
  busuu_score: '',
  busuu_link: '',
});

// ──────────────────────────────────────────────────────────────
// Sub-componente: Formulario de Pronunciación
// ──────────────────────────────────────────────────────────────
interface PronFormData {
  duration_minutes: number;
  session_date: string;
  pronunciation_type: string;
  pronunciation_focus: string;
  pronunciation_material: string;
  pronunciation_self_eval: string;
}

const emptyPron = (): PronFormData => ({
  duration_minutes: 15,
  session_date: new Date().toISOString().split('T')[0],
  pronunciation_type: '',
  pronunciation_focus: '',
  pronunciation_material: '',
  pronunciation_self_eval: '',
});

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const SESSION_COLORS: Record<EnglishSessionType, string> = {
  assimil: '#6366F1',
  busuu: '#10B981',
  pronunciacion: '#F59E0B',
};

const SESSION_LABELS: Record<EnglishSessionType, string> = {
  assimil: 'Assimil',
  busuu: 'Busuu',
  pronunciacion: 'Pronunciación',
};

const SESSION_ICONS: Record<EnglishSessionType, React.ReactNode> = {
  assimil: <BookOpen size={16} />,
  busuu: <Globe size={16} />,
  pronunciacion: <Mic size={16} />,
};

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────
const EnglishModule: React.FC = () => {
  const { theme, activeProfileId, englishSessions, addEnglishSession, deleteEnglishSession } = useAppStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<EnglishSessionType | 'historial'>('assimil');
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [assimilForm, setAssimilForm] = useState<AssimilFormData>(emptyAssimil());
  const [busuuForm, setBusuuForm] = useState<BusuuFormData>(emptyBusuu());
  const [pronForm, setPronForm] = useState<PronFormData>(emptyPron());

  const profileSessions = useMemo(
    () => englishSessions.filter(s => s.profile_id === activeProfileId)
      .sort((a, b) => b.session_date.localeCompare(a.session_date)),
    [englishSessions, activeProfileId]
  );

  // Stats globales
  const stats = useMemo(() => {
    const total = profileSessions.length;
    const totalMin = profileSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const byType = {
      assimil: profileSessions.filter(s => s.session_type === 'assimil').length,
      busuu: profileSessions.filter(s => s.session_type === 'busuu').length,
      pronunciacion: profileSessions.filter(s => s.session_type === 'pronunciacion').length,
    };
    // sesiones de esta semana
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeek = profileSessions.filter(s => {
      try { return isWithinInterval(parseISO(s.session_date), { start: weekStart, end: weekEnd }); }
      catch { return false; }
    });
    const thisWeekMin = thisWeek.reduce((acc, s) => acc + s.duration_minutes, 0);
    return { total, totalMin, byType, thisWeek: thisWeek.length, thisWeekMin };
  }, [profileSessions]);

  // Datos para el gráfico (últimas 8 semanas agrupadas por semana)
  const chartData = useMemo(() => {
    const weeks: Record<string, number> = {};
    profileSessions.forEach(s => {
      try {
        const d = parseISO(s.session_date);
        const key = format(startOfWeek(d, { weekStartsOn: 1 }), 'dd MMM', { locale: es });
        weeks[key] = (weeks[key] || 0) + s.duration_minutes;
      } catch { /* ignore invalid dates */ }
    });
    return Object.entries(weeks).slice(-8).map(([week, minutes]) => ({ week, minutes }));
  }, [profileSessions]);

  // ── Handlers de submit ──────────────────────────────────────
  const handleSubmitAssimil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;
    addEnglishSession({
      profile_id: activeProfileId,
      session_type: 'assimil',
      session_date: assimilForm.session_date,
      duration_minutes: assimilForm.duration_minutes,
      assimil_lesson: assimilForm.assimil_lesson,
      assimil_phase: assimilForm.assimil_phase,
      assimil_notes: assimilForm.assimil_notes || undefined,
    });
    setAssimilForm(emptyAssimil());
    setShowForm(false);
  };

  const handleSubmitBusuu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;
    addEnglishSession({
      profile_id: activeProfileId,
      session_type: 'busuu',
      session_date: busuuForm.session_date,
      duration_minutes: busuuForm.duration_minutes,
      busuu_unit: busuuForm.busuu_unit,
      busuu_score: busuuForm.busuu_score ? Number(busuuForm.busuu_score) : undefined,
      busuu_link: busuuForm.busuu_link || undefined,
    });
    setBusuuForm(emptyBusuu());
    setShowForm(false);
  };

  const handleSubmitPron = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;
    addEnglishSession({
      profile_id: activeProfileId,
      session_type: 'pronunciacion',
      session_date: pronForm.session_date,
      duration_minutes: pronForm.duration_minutes,
      pronunciation_type: pronForm.pronunciation_type || undefined,
      pronunciation_focus: pronForm.pronunciation_focus || undefined,
      pronunciation_material: pronForm.pronunciation_material || undefined,
      pronunciation_self_eval: pronForm.pronunciation_self_eval || undefined,
    });
    setPronForm(emptyPron());
    setShowForm(false);
  };

  // ── Estilos reutilizables ────────────────────────────────────
  const card = `p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`;
  const input = `w-full p-4 rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/30 ${isDark ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400'}`;
  const label = 'block text-xs font-black uppercase tracking-widest mb-2 text-indigo-500';

  // ── Render de tarjeta de sesión ──────────────────────────────
  const renderSessionCard = (session: EnglishSession) => {
    const color = SESSION_COLORS[session.session_type];
    return (
      <div
        key={session.id}
        className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
        style={{ borderLeftWidth: '3px', borderLeftColor: color }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg text-white" style={{ backgroundColor: color }}>
              {SESSION_ICONS[session.session_type]}
            </div>
            <div>
              <span className="font-black text-sm">{SESSION_LABELS[session.session_type]}</span>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {format(parseISO(session.session_date), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Clock size={11} />
              {session.duration_minutes} min
            </div>
            <button
              onClick={() => deleteEnglishSession(session.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Eliminar sesión"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Detalles Assimil */}
        {session.session_type === 'assimil' && (
          <div className="space-y-2 mt-3">
            {session.assimil_lesson && (
              <div className="flex items-center gap-2">
                <BookOpen size={13} className="text-indigo-500 flex-shrink-0" />
                <span className="text-sm font-bold">{session.assimil_lesson}</span>
              </div>
            )}
            {session.assimil_phase && (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                session.assimil_phase === 'activa'
                  ? 'bg-indigo-500/20 text-indigo-500'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                Fase {session.assimil_phase}
              </span>
            )}
            {session.assimil_notes && (
              <p className={`text-xs leading-relaxed mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {session.assimil_notes}
              </p>
            )}
          </div>
        )}

        {/* Detalles Busuu */}
        {session.session_type === 'busuu' && (
          <div className="space-y-2 mt-3">
            {session.busuu_unit && (
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-bold">{session.busuu_unit}</span>
              </div>
            )}
            {session.busuu_score !== undefined && (
              <div className="flex items-center gap-2">
                <Star size={13} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-bold">{session.busuu_score}%</span>
              </div>
            )}
            {session.busuu_link && (
              <a
                href={session.busuu_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-emerald-500 hover:underline"
              >
                <Link size={11} />
                Ver ejercicio en Busuu
              </a>
            )}
          </div>
        )}

        {/* Detalles Pronunciación */}
        {session.session_type === 'pronunciacion' && (
          <div className="space-y-2 mt-3">
            {session.pronunciation_type && (
              <div className="flex items-center gap-2">
                <Mic size={13} className="text-amber-500 flex-shrink-0" />
                <span className="text-sm font-bold">{session.pronunciation_type}</span>
              </div>
            )}
            {session.pronunciation_focus && (
              <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600`}>
                {session.pronunciation_focus}
              </div>
            )}
            {session.pronunciation_material && (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Material: {session.pronunciation_material}
              </p>
            )}
            {session.pronunciation_self_eval && (
              <p className={`text-xs italic leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                "{session.pronunciation_self_eval}"
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Sesiones filtradas por tab activo (excl. 'historial')
  const filteredSessions = activeTab === 'historial'
    ? profileSessions
    : profileSessions.filter(s => s.session_type === activeTab);

  // ── JSX principal ────────────────────────────────────────────
  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
              <Languages size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Inglés</h1>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Registro de práctica — Assimil · Busuu · Pronunciación
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); }}
          className="flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-sky-500 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Nueva Sesión
        </button>
      </div>

      {/* ── Stats rápidas ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total sesiones', value: stats.total, color: 'from-sky-500 to-blue-600', icon: <Languages size={18} /> },
          { label: 'Tiempo total', value: `${Math.floor(stats.totalMin / 60)}h ${stats.totalMin % 60}m`, color: 'from-indigo-500 to-purple-500', icon: <Clock size={18} /> },
          { label: 'Esta semana', value: `${stats.thisWeek} sesión${stats.thisWeek !== 1 ? 'es' : ''}`, color: 'from-emerald-500 to-teal-500', icon: <TrendingUp size={18} /> },
          { label: 'Min. esta semana', value: `${stats.thisWeekMin} min`, color: 'from-amber-500 to-orange-500', icon: <BarChart3 size={18} /> },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${s.color} text-white mb-3 shadow`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mini gráfico semanal ────────────────────────────── */}
      {chartData.length > 0 && (
        <div className={card}>
          <h2 className="text-base font-black mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-sky-500" />
            Minutos por semana
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} barSize={24}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => [`${v} min`, 'Práctica']}
                contentStyle={{
                  background: isDark ? '#1e293b' : '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700
                }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill="#0EA5E9" opacity={idx === chartData.length - 1 ? 1 : 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tabs de metodología ─────────────────────────────── */}
      <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {(['assimil', 'busuu', 'pronunciacion', 'historial'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-sky-600 text-white shadow'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'historial' ? 'Historial' : SESSION_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ── Formulario inline de nueva sesión ──────────────── */}
      {showForm && (
        <div className={`p-8 rounded-3xl border-2 shadow-2xl animate-in slide-in-from-top duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {/* Header formulario */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="p-2 rounded-xl text-white" style={{ backgroundColor: activeTab !== 'historial' ? SESSION_COLORS[activeTab as EnglishSessionType] : '#0EA5E9' }}>
                {activeTab !== 'historial' ? SESSION_ICONS[activeTab as EnglishSessionType] : <Languages size={16} />}
              </span>
              Nueva sesión — {activeTab !== 'historial' ? SESSION_LABELS[activeTab as EnglishSessionType] : 'Inglés'}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Sub-tab para seleccionar tipo dentro del formulario */}
          <div className={`flex gap-1 p-1 rounded-xl mb-6 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
            {(['assimil', 'busuu', 'pronunciacion'] as EnglishSessionType[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === t
                    ? 'text-white shadow'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
                style={activeTab === t ? { backgroundColor: SESSION_COLORS[t] } : {}}
              >
                {SESSION_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Campos comunes: fecha + duración */}
          {(activeTab === 'assimil' || activeTab === 'busuu' || activeTab === 'pronunciacion') && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={label}>Fecha</label>
                <input
                  type="date"
                  className={input}
                  value={
                    activeTab === 'assimil' ? assimilForm.session_date
                    : activeTab === 'busuu' ? busuuForm.session_date
                    : pronForm.session_date
                  }
                  onChange={e => {
                    if (activeTab === 'assimil') setAssimilForm(f => ({ ...f, session_date: e.target.value }));
                    else if (activeTab === 'busuu') setBusuuForm(f => ({ ...f, session_date: e.target.value }));
                    else setPronForm(f => ({ ...f, session_date: e.target.value }));
                  }}
                />
              </div>
              <div>
                <label className={label}>Duración (min)</label>
                <input
                  type="number"
                  min={1}
                  max={480}
                  className={input}
                  value={
                    activeTab === 'assimil' ? assimilForm.duration_minutes
                    : activeTab === 'busuu' ? busuuForm.duration_minutes
                    : pronForm.duration_minutes
                  }
                  onChange={e => {
                    const v = parseInt(e.target.value) || 1;
                    if (activeTab === 'assimil') setAssimilForm(f => ({ ...f, duration_minutes: v }));
                    else if (activeTab === 'busuu') setBusuuForm(f => ({ ...f, duration_minutes: v }));
                    else setPronForm(f => ({ ...f, duration_minutes: v }));
                  }}
                />
              </div>
            </div>
          )}

          {/* Campos específicos: Assimil */}
          {activeTab === 'assimil' && (
            <form onSubmit={handleSubmitAssimil} className="space-y-4">
              <div>
                <label className={label}>Lección Assimil</label>
                <input
                  type="text"
                  required
                  placeholder='Ej: "Lección 15 - La Familia"'
                  className={input}
                  value={assimilForm.assimil_lesson}
                  onChange={e => setAssimilForm(f => ({ ...f, assimil_lesson: e.target.value }))}
                />
              </div>
              <div>
                <label className={label}>Fase de Estudio</label>
                <div className="flex gap-3">
                  {(['pasiva', 'activa'] as AssimilPhase[]).map(ph => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => setAssimilForm(f => ({ ...f, assimil_phase: ph }))}
                      className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2 ${
                        assimilForm.assimil_phase === ph
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      Fase {ph}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={label}>Notas (frases, vocabulario, gramática)</label>
                <textarea
                  rows={3}
                  placeholder='Ej: "She has been → ha tenido. Nota entonación en preguntas."'
                  className={`${input} resize-none`}
                  value={assimilForm.assimil_notes}
                  onChange={e => setAssimilForm(f => ({ ...f, assimil_notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-black text-sm text-white shadow" style={{ backgroundColor: SESSION_COLORS.assimil }}>
                  Guardar sesión
                </button>
              </div>
            </form>
          )}

          {/* Campos específicos: Busuu */}
          {activeTab === 'busuu' && (
            <form onSubmit={handleSubmitBusuu} className="space-y-4">
              <div>
                <label className={label}>Unidad / Lección Busuu</label>
                <input
                  type="text"
                  required
                  placeholder='Ej: "Unidad 3 - Comprando en el supermercado"'
                  className={input}
                  value={busuuForm.busuu_unit}
                  onChange={e => setBusuuForm(f => ({ ...f, busuu_unit: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Puntuación / Progreso (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Ej: 85"
                    className={input}
                    value={busuuForm.busuu_score}
                    onChange={e => setBusuuForm(f => ({ ...f, busuu_score: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={label}>Enlace al ejercicio (opcional)</label>
                  <input
                    type="url"
                    placeholder="https://busuu.com/..."
                    className={input}
                    value={busuuForm.busuu_link}
                    onChange={e => setBusuuForm(f => ({ ...f, busuu_link: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-black text-sm text-white shadow" style={{ backgroundColor: SESSION_COLORS.busuu }}>
                  Guardar sesión
                </button>
              </div>
            </form>
          )}

          {/* Campos específicos: Pronunciación */}
          {activeTab === 'pronunciacion' && (
            <form onSubmit={handleSubmitPron} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Tipo de práctica</label>
                  <input
                    type="text"
                    placeholder='Ej: "Minimal Pairs", "Lectura en voz alta"'
                    className={input}
                    value={pronForm.pronunciation_type}
                    onChange={e => setPronForm(f => ({ ...f, pronunciation_type: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={label}>Foco fonético</label>
                  <input
                    type="text"
                    placeholder='Ej: "Sonido /th/", "Entonación de preguntas"'
                    className={input}
                    value={pronForm.pronunciation_focus}
                    onChange={e => setPronForm(f => ({ ...f, pronunciation_focus: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={label}>Material de apoyo</label>
                <input
                  type="text"
                  placeholder='Ej: "Video YouTube /r/ y /l/", "Lista de palabras difíciles"'
                  className={input}
                  value={pronForm.pronunciation_material}
                  onChange={e => setPronForm(f => ({ ...f, pronunciation_material: e.target.value }))}
                />
              </div>
              <div>
                <label className={label}>Autoevaluación / Notas</label>
                <textarea
                  rows={3}
                  placeholder='¿Cómo estuvo tu pronunciación? ¿Qué áreas mejorar?'
                  className={`${input} resize-none`}
                  value={pronForm.pronunciation_self_eval}
                  onChange={e => setPronForm(f => ({ ...f, pronunciation_self_eval: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-black text-sm text-white shadow" style={{ backgroundColor: SESSION_COLORS.pronunciacion }}>
                  Guardar sesión
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Lista de sesiones ───────────────────────────────── */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            <Languages size={40} className="mb-3 opacity-30" />
            <p className="font-bold text-sm">
              {activeTab === 'historial'
                ? 'Aún no hay sesiones registradas'
                : `Aún no hay sesiones de ${SESSION_LABELS[activeTab as EnglishSessionType]}`}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2 rounded-xl font-black text-sm text-white bg-sky-600 hover:bg-sky-500 transition-all"
            >
              + Registrar sesión
            </button>
          </div>
        ) : (
          filteredSessions.map(renderSessionCard)
        )}
      </div>
    </div>
  );
};

export default EnglishModule;
