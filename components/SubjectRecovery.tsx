import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Subject, SchoolPeriod } from '../types';
import {
  BookOpen, Calendar, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Save, RefreshCw, Plus, Sparkles
} from 'lucide-react';

interface SubjectRecoveryData {
  subject: Subject;
  needsPeriod: boolean;
  needsSchedule: boolean;
  selectedPeriodId?: string;
  schedules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
}

const SubjectRecovery: React.FC = () => {
  const {
    theme,
    activeProfileId,
    subjects,
    periods,
    schedules,
    updateSubject,
    addPeriod,
    syncWithSupabase
  } = useAppStore();

  const [recoveryData, setRecoveryData] = useState<SubjectRecoveryData[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('');
  const [newPeriodEnd, setNewPeriodEnd] = useState('');

  // Días de la semana en español
  const daysOfWeek = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' }
  ];

  // Cargar datos al inicio
  useEffect(() => {
    loadRecoveryData();
  }, [subjects, periods, schedules, activeProfileId]);

  const loadRecoveryData = async () => {
    setIsLoading(true);

    // Sincronizar con Supabase primero
    await syncWithSupabase();

    if (!activeProfileId) {
      setIsLoading(false);
      return;
    }

    const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
    const profileSchedules = schedules.filter(s =>
      profileSubjects.some(sub => sub.id === s.subject_id)
    );

    const data: SubjectRecoveryData[] = profileSubjects.map(subject => {
      const subjectSchedules = profileSchedules.filter(s => s.subject_id === subject.id);

      return {
        subject,
        needsPeriod: !subject.school_period_id,
        needsSchedule: subjectSchedules.length === 0,
        selectedPeriodId: subject.school_period_id || undefined,
        schedules: subjectSchedules.map(s => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time
        }))
      };
    });

    setRecoveryData(data);
    setIsLoading(false);
  };

  const toggleSubject = (subjectId: string) => {
    const newSet = new Set(expandedSubjects);
    if (newSet.has(subjectId)) {
      newSet.delete(subjectId);
    } else {
      newSet.add(subjectId);
    }
    setExpandedSubjects(newSet);
  };

  const handlePeriodChange = (subjectId: string, periodId: string) => {
    setRecoveryData(prev => prev.map(data =>
      data.subject.id === subjectId
        ? { ...data, selectedPeriodId: periodId, needsPeriod: false }
        : data
    ));
  };

  const handleAddSchedule = (subjectId: string) => {
    setRecoveryData(prev => prev.map(data =>
      data.subject.id === subjectId
        ? {
            ...data,
            schedules: [...data.schedules, {
              day_of_week: 1, // Lunes por defecto
              start_time: '08:00',
              end_time: '10:00'
            }]
          }
        : data
    ));
  };

  const handleScheduleChange = (
    subjectId: string,
    scheduleIndex: number,
    field: 'day_of_week' | 'start_time' | 'end_time',
    value: number | string
  ) => {
    setRecoveryData(prev => prev.map(data => {
      if (data.subject.id === subjectId) {
        const newSchedules = [...data.schedules];
        newSchedules[scheduleIndex] = {
          ...newSchedules[scheduleIndex],
          [field]: value
        };
        return { ...data, schedules: newSchedules, needsSchedule: false };
      }
      return data;
    }));
  };

  const handleRemoveSchedule = (subjectId: string, scheduleIndex: number) => {
    setRecoveryData(prev => prev.map(data => {
      if (data.subject.id === subjectId) {
        const newSchedules = data.schedules.filter((_, i) => i !== scheduleIndex);
        return {
          ...data,
          schedules: newSchedules,
          needsSchedule: newSchedules.length === 0
        };
      }
      return data;
    }));
  };

  const handleCreatePeriod = () => {
    if (!newPeriodName.trim() || !newPeriodStart || !newPeriodEnd || !activeProfileId) return;

    addPeriod({
      profile_id: activeProfileId,
      name: newPeriodName.trim(),
      start_date: newPeriodStart,
      end_date: newPeriodEnd,
      is_active: true,
      period_type: 'semestre'
    });

    setNewPeriodName('');
    setNewPeriodStart('');
    setNewPeriodEnd('');
    setShowCreatePeriod(false);
  };

  const handleSaveSubject = async (data: SubjectRecoveryData) => {
    try {
      // Actualizar período de la materia
      if (data.selectedPeriodId) {
        await updateSubject(data.subject.id, {
          school_period_id: data.selectedPeriodId
        });
      }

      // TODO: Aquí necesitarías agregar los horarios a Supabase
      // Por ahora solo actualizamos localmente
      console.log('Guardando horarios para', data.subject.name, data.schedules);

      alert(`¡Materia "${data.subject.name}" actualizada correctamente!`);
      await loadRecoveryData();
    } catch (error) {
      console.error('Error al guardar materia:', error);
      alert('Error al guardar la materia. Por favor intenta de nuevo.');
    }
  };

  const profilePeriods = periods.filter(p => p.profile_id === activeProfileId);
  const subjectsNeedingAttention = recoveryData.filter(d => d.needsPeriod || d.needsSchedule);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            Cargando materias...
          </p>
        </div>
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Selecciona un perfil para recuperar materias</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className={`relative p-8 lg:p-12 rounded-3xl lg:rounded-[3.5rem] backdrop-blur-2xl border-2 shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/40 border-white/10'
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <BookOpen size={48} className="text-indigo-600 drop-shadow-lg" />
              <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recuperar Materias
              </h1>
              <p className={`text-lg font-medium mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Completa la información de tus materias existentes
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-indigo-600">{recoveryData.length}</p>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Materias Totales
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-yellow-600">{subjectsNeedingAttention.length}</p>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Necesitan Atención
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-green-600">
                    {recoveryData.length - subjectsNeedingAttention.length}
                  </p>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Completas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón crear período */}
          <button
            onClick={() => setShowCreatePeriod(true)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Nuevo Período
          </button>
        </div>
      </div>

      {/* Modal Crear Período */}
      {showCreatePeriod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300 ${
            theme === 'dark' ? 'bg-slate-900 border-2 border-white/10' : 'bg-white'
          }`}>
            <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Crear Nuevo Período
            </h2>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-bold mb-3 uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Nombre del Período
                </label>
                <input
                  type="text"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  placeholder="ej: Semestre 2024-1"
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-3 uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={newPeriodStart}
                    onChange={(e) => setNewPeriodStart(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl border-2 font-semibold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-3 uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={newPeriodEnd}
                    onChange={(e) => setNewPeriodEnd(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl border-2 font-semibold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCreatePeriod(false)}
                className={`flex-1 px-8 py-4 rounded-2xl font-bold ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePeriod}
                disabled={!newPeriodName.trim() || !newPeriodStart || !newPeriodEnd}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Período
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Materias */}
      <div className="space-y-6">
        {recoveryData.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={80} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-400">No se encontraron materias</p>
            <p className="text-slate-500 mt-2">Sincronizando con la base de datos...</p>
          </div>
        ) : (
          recoveryData.map((data, index) => {
            const isExpanded = expandedSubjects.has(data.subject.id);
            const needsAttention = data.needsPeriod || data.needsSchedule;

            return (
              <div
                key={data.subject.id}
                className="group relative animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect */}
                <div
                  className={`absolute -inset-1 rounded-3xl blur-xl opacity-30 transition-opacity ${
                    needsAttention ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ backgroundColor: data.subject.color }}
                />

                <div className={`relative p-6 rounded-3xl backdrop-blur-xl border-2 shadow-xl ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 border-white/10'
                    : 'bg-white/60 border-slate-200/50'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => toggleSubject(data.subject.id)}
                      className="flex items-center gap-4 flex-1"
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: data.subject.color + '20',
                          border: `3px solid ${data.subject.color}`
                        }}
                      >
                        <BookOpen className="w-8 h-8" style={{ color: data.subject.color }} />
                      </div>

                      <div className="flex-1 text-left">
                        <h3 className="text-2xl font-black" style={{ color: data.subject.color }}>
                          {data.subject.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {needsAttention ? (
                            <>
                              <AlertCircle size={16} className="text-yellow-500" />
                              <span className="text-sm font-bold text-yellow-500">
                                Necesita atención
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} className="text-green-500" />
                              <span className="text-sm font-bold text-green-500">
                                Completa
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={32}
                        className={`transition-transform duration-300 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        style={{ color: data.subject.color }}
                      />
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 space-y-6 animate-in fade-in duration-300">
                      {/* Período Escolar */}
                      <div>
                        <label className={`block text-sm font-bold mb-3 uppercase flex items-center gap-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <Calendar size={16} />
                          Período Escolar
                          {data.needsPeriod && (
                            <span className="text-yellow-500 text-xs">(Requerido)</span>
                          )}
                        </label>
                        <select
                          value={data.selectedPeriodId || ''}
                          onChange={(e) => handlePeriodChange(data.subject.id, e.target.value)}
                          className={`w-full px-6 py-4 rounded-2xl border-2 font-semibold ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Seleccionar período...</option>
                          {profilePeriods.map(period => (
                            <option key={period.id} value={period.id}>
                              {period.name} ({period.start_date} - {period.end_date})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Horarios */}
                      <div>
                        <label className={`block text-sm font-bold mb-3 uppercase flex items-center gap-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <Clock size={16} />
                          Horarios de Clase
                          {data.needsSchedule && (
                            <span className="text-yellow-500 text-xs">(Opcional)</span>
                          )}
                        </label>

                        {data.schedules.map((schedule, idx) => (
                          <div key={idx} className={`flex gap-4 mb-4 p-4 rounded-2xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100/50'
                          }`}>
                            <select
                              value={schedule.day_of_week}
                              onChange={(e) => handleScheduleChange(
                                data.subject.id,
                                idx,
                                'day_of_week',
                                parseInt(e.target.value)
                              )}
                              className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold ${
                                theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              {daysOfWeek.map(day => (
                                <option key={day.id} value={day.id}>
                                  {day.name}
                                </option>
                              ))}
                            </select>

                            <input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) => handleScheduleChange(
                                data.subject.id,
                                idx,
                                'start_time',
                                e.target.value
                              )}
                              className={`px-4 py-3 rounded-xl border-2 font-semibold ${
                                theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />

                            <input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) => handleScheduleChange(
                                data.subject.id,
                                idx,
                                'end_time',
                                e.target.value
                              )}
                              className={`px-4 py-3 rounded-xl border-2 font-semibold ${
                                theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />

                            <button
                              onClick={() => handleRemoveSchedule(data.subject.id, idx)}
                              className="px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => handleAddSchedule(data.subject.id)}
                          className="w-full px-6 py-3 rounded-2xl border-2 border-dashed font-bold transition-all hover:scale-105"
                          style={{
                            color: data.subject.color,
                            borderColor: data.subject.color + '50',
                            backgroundColor: data.subject.color + '10'
                          }}
                        >
                          + Agregar Horario
                        </button>
                      </div>

                      {/* Botón Guardar */}
                      <button
                        onClick={() => handleSaveSubject(data)}
                        className="w-full px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                        style={{
                          background: `linear-gradient(135deg, ${data.subject.color}, ${data.subject.color}dd)`,
                          color: 'white'
                        }}
                      >
                        <Save size={24} />
                        Guardar Cambios
                        <CheckCircle2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubjectRecovery;
