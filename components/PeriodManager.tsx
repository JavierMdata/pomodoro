/**
 * Componente para gestionar periodos académicos dinámicos
 * Permite crear periodos de tipo Trimestre, Semestre, Año o Personalizado
 * Muestra progreso temporal (ej. "Semana 4 de 12")
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { SchoolPeriod, PeriodType, PeriodProgress } from '../types';
import {
  Calendar, Plus, Trash2, Clock, TrendingUp, Edit2, Check, X,
  AlertCircle, CalendarDays, Timer
} from 'lucide-react';
import { format, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

// Función helper para calcular progreso (fuera del componente)
const calculatePeriodProgress = (period: SchoolPeriod): PeriodProgress => {
  const start = new Date(period.start_date);
  const end = new Date(period.end_date);
  const today = new Date();

  // Calcular diferencia en días y convertir a semanas
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceStart = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const totalWeeks = Math.ceil(totalDays / 7) || 1;
  let currentWeek = Math.ceil(daysSinceStart / 7) + 1;

  // Ajustar límites
  currentWeek = Math.max(1, Math.min(currentWeek, totalWeeks));

  const weeksRemaining = Math.max(0, totalWeeks - currentWeek);
  const progressPercentage = Math.round((currentWeek / totalWeeks) * 100);

  return {
    current_week: currentWeek,
    total_weeks: totalWeeks,
    weeks_remaining: weeksRemaining,
    progress_percentage: progressPercentage
  };
};

const PeriodManager: React.FC = () => {
  const { theme, activeProfileId, profiles, periods, addPeriod, updatePeriod, deletePeriod } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    period_type: 'semestre' as PeriodType,
    start_date: '',
    end_date: '',
    description: ''
  });

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const profilePeriods = periods.filter(p => p.profile_id === activeProfileId);

  // Calcular progreso de cada periodo
  const periodsWithProgress = useMemo(() => {
    return profilePeriods.map(period => {
      const progress = calculatePeriodProgress(period);
      return { ...period, progress };
    });
  }, [profilePeriods]);

  const getPeriodTypeLabel = (type: PeriodType) => {
    const labels = {
      'trimestre': 'Trimestre',
      'semestre': 'Semestre',
      'año': 'Año Académico',
      'custom': 'Personalizado'
    };
    return labels[type] || type;
  };

  const getDefaultDates = (type: PeriodType) => {
    const today = new Date();
    let endDate = new Date();

    switch (type) {
      case 'trimestre':
        endDate = addWeeks(today, 12);
        break;
      case 'semestre':
        endDate = addWeeks(today, 18);
        break;
      case 'año':
        endDate = addWeeks(today, 40);
        break;
      default:
        endDate = addWeeks(today, 16);
    }

    return {
      start_date: format(today, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    };
  };

  const handlePeriodTypeChange = (type: PeriodType) => {
    const dates = getDefaultDates(type);
    setFormData(prev => ({
      ...prev,
      period_type: type,
      ...dates
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId || !formData.name.trim() || !formData.start_date || !formData.end_date) return;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7) || 1;

    if (editingId) {
      updatePeriod(editingId, {
        ...formData,
        total_weeks: totalWeeks
      });
      setEditingId(null);
    } else {
      addPeriod({
        ...formData,
        profile_id: activeProfileId,
        is_active: true,
        total_weeks: totalWeeks
      });
    }

    // Reset form
    setFormData({
      name: '',
      period_type: 'semestre',
      start_date: '',
      end_date: '',
      description: ''
    });
    setShowCreateForm(false);
  };

  const handleEdit = (period: SchoolPeriod) => {
    setFormData({
      name: period.name,
      period_type: period.period_type || 'semestre',
      start_date: period.start_date,
      end_date: period.end_date,
      description: period.description || ''
    });
    setEditingId(period.id);
    setShowCreateForm(true);
  };

  const handleDelete = (periodId: string) => {
    if (window.confirm('¿Eliminar este periodo? Las materias vinculadas perderán su referencia.')) {
      deletePeriod(periodId);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'text-emerald-500 bg-emerald-500/10';
    if (percentage < 70) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg">
            <CalendarDays size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Periodos Académicos</h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold mt-1`}>
              Gestiona tus ciclos de estudio y monitorea tu progreso temporal
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingId(null);
            const dates = getDefaultDates('semestre');
            setFormData({
              name: '',
              period_type: 'semestre',
              ...dates,
              description: ''
            });
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          {showCreateForm ? 'Cancelar' : 'Nuevo Periodo'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className={`p-6 rounded-2xl border animate-in slide-in-from-top duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del Periodo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Nombre del Periodo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Semestre 2026-1"
                  className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Tipo de Periodo */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Tipo de Periodo *
                </label>
                <select
                  value={formData.period_type}
                  onChange={(e) => handlePeriodTypeChange(e.target.value as PeriodType)}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                >
                  <option value="trimestre">Trimestre (12 semanas)</option>
                  <option value="semestre">Semestre (18 semanas)</option>
                  <option value="año">Año Académico (40 semanas)</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Periodo regular de primavera"
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} />
                {editingId ? 'Actualizar Periodo' : 'Crear Periodo'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                }}
                className={`px-6 py-3 font-bold rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Periodos List */}
      {periodsWithProgress.length === 0 ? (
        <div className={`p-12 rounded-2xl border-2 border-dashed text-center ${
          theme === 'dark'
            ? 'bg-slate-900/50 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <Calendar size={64} className="mx-auto mb-4 text-slate-400" />
          <h3 className="text-xl font-bold mb-2">No hay periodos académicos</h3>
          <p className="text-slate-400 mb-6">Crea tu primer periodo para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {periodsWithProgress.map(period => (
            <div
              key={period.id}
              className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
                period.is_active
                  ? theme === 'dark'
                    ? 'bg-slate-900 border-indigo-500/50'
                    : 'bg-white border-indigo-300'
                  : theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black">{period.name}</h3>
                    {period.is_active && (
                      <span className="px-2 py-1 text-xs font-bold bg-indigo-500 text-white rounded-lg">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    {getPeriodTypeLabel(period.period_type || 'semestre')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(period)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 size={16} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(period.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              {period.progress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer size={16} className="text-indigo-500" />
                      <span className="text-sm font-bold">
                        Semana {period.progress.current_week} de {period.progress.total_weeks}
                      </span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${getProgressColor(period.progress.progress_percentage)}`}>
                      {period.progress.progress_percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${period.progress.progress_percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {period.progress.weeks_remaining > 0
                      ? `${period.progress.weeks_remaining} semanas restantes`
                      : 'Periodo finalizado'}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-400 text-xs font-bold mb-1">INICIO</p>
                    <p className="font-bold">
                      {format(new Date(period.start_date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold mb-1">FIN</p>
                    <p className="font-bold">
                      {format(new Date(period.end_date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              {period.description && (
                <p className="mt-3 text-sm text-slate-400 italic">
                  {period.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodManager;
