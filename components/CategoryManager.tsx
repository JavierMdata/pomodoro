/**
 * GESTOR CENTRAL DE CATEGORÍAS - Life Command Center
 * Diseño moderno con cards visualmente atractivas y modal refinado
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { WorkCategory, CategoryPeriodType, CategoryInstance } from '../types';
import {
  Plus, BookOpen, Languages, Briefcase, Dumbbell, FolderKanban,
  Clock, Calendar, Edit2, Trash2, X,
  Coffee, ArrowRight, Sparkles
} from 'lucide-react';
import CategoryView from './CategoryView';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface CategoryManagerProps {
  filterType?: 'all' | 'all-except-materia' | WorkCategory;
  categoryInstanceId?: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ filterType = 'all', categoryInstanceId }) => {
  const {
    theme,
    activeProfileId,
    categoryInstances,
    addCategoryInstance,
    updateCategoryInstance,
    deleteCategoryInstance
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<CategoryInstance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInstance | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_type: 'materia' as WorkCategory,
    period_type: 'semestral' as CategoryPeriodType,
    start_date: '',
    end_date: '',
    schedule_days: [1, 3, 5] as number[],
    schedule_start_time: '14:00',
    schedule_end_time: '16:00',
    times_per_week: 3,
    color: '#6366F1',
    icon: '📚'
  });

  const isDark = theme === 'dark';

  // Filtrar category_instances
  let profileInstances = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);

  if (categoryInstanceId) {
    profileInstances = profileInstances.filter(ci => ci.id === categoryInstanceId);
  } else if (filterType === 'all-except-materia') {
    profileInstances = profileInstances.filter(ci => ci.category_type !== 'materia');
  } else if (filterType !== 'all') {
    profileInstances = profileInstances.filter(ci => ci.category_type === filterType);
  }

  // Agrupar por tipo y ordenar
  const categoryTypeOrder: Record<string, number> = {
    'materia': 0, 'trabajo': 1, 'idioma': 2, 'gym': 3, 'proyecto': 4, 'descanso': 5, 'otro': 6
  };

  const allCategories = profileInstances
    .map(instance => ({
      id: instance.id,
      isLegacy: false,
      name: instance.name,
      color: instance.color,
      category_type: instance.category_type,
      period_type: instance.period_type,
      schedule_days: instance.schedule_days,
      schedule_start_time: instance.schedule_start_time,
      schedule_end_time: instance.schedule_end_time,
      times_per_week: instance.times_per_week,
      start_date: instance.start_date,
      end_date: instance.end_date,
      needsPeriod: false
    }))
    .sort((a, b) => {
      const typeA = categoryTypeOrder[a.category_type] ?? 99;
      const typeB = categoryTypeOrder[b.category_type] ?? 99;
      if (typeA !== typeB) return typeA - typeB;
      return a.name.localeCompare(b.name);
    });

  const getCategoryIcon = (type: WorkCategory, size = 20) => {
    const icons = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Coffee size={size} />,
      'otro': <Calendar size={size} />
    };
    return icons[type] || icons.otro;
  };

  const getCategoryColor = (type: WorkCategory) => {
    const colors = {
      'materia': '#6366F1',
      'idioma': '#A855F7',
      'trabajo': '#10B981',
      'gym': '#F97316',
      'proyecto': '#06B6D4',
      'descanso': '#F59E0B',
      'otro': '#64748B'
    };
    return colors[type];
  };

  const getCategoryLabel = (type: WorkCategory) => {
    const labels = {
      'materia': 'Materia',
      'idioma': 'Idioma',
      'trabajo': 'Trabajo',
      'gym': 'Gym',
      'proyecto': 'Proyecto',
      'descanso': 'Descanso',
      'otro': 'Otro'
    };
    return labels[type];
  };

  const getCategoryGradient = (type: WorkCategory) => {
    const gradients: Record<string, string> = {
      'materia': 'from-indigo-500 to-purple-500',
      'idioma': 'from-purple-500 to-pink-500',
      'trabajo': 'from-emerald-500 to-teal-500',
      'gym': 'from-orange-500 to-red-500',
      'proyecto': 'from-cyan-500 to-blue-500',
      'descanso': 'from-amber-500 to-yellow-500',
      'otro': 'from-slate-500 to-gray-500'
    };
    return gradients[type] || gradients.otro;
  };

  const handleOpenModal = (instance?: CategoryInstance) => {
    if (instance) {
      setEditingInstance(instance);
      setFormData({
        name: instance.name,
        category_type: instance.category_type,
        period_type: instance.period_type,
        start_date: instance.start_date || '',
        end_date: instance.end_date || '',
        schedule_days: instance.schedule_days,
        schedule_start_time: instance.schedule_start_time,
        schedule_end_time: instance.schedule_end_time,
        times_per_week: instance.times_per_week,
        color: instance.color,
        icon: instance.icon || '📚'
      });
    } else {
      setEditingInstance(null);
      setFormData({
        name: '',
        category_type: 'materia',
        period_type: 'semestral',
        start_date: '',
        end_date: '',
        schedule_days: [1, 3, 5],
        schedule_start_time: '14:00',
        schedule_end_time: '16:00',
        times_per_week: 3,
        color: '#6366F1',
        icon: '📚'
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!activeProfileId || !formData.name) return;

    const instanceData = {
      ...formData,
      profile_id: activeProfileId,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingInstance) {
        await updateCategoryInstance(editingInstance.id, instanceData);
      } else {
        await addCategoryInstance(instanceData);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta categoría? Se eliminarán todos los datos asociados.')) {
      await deleteCategoryInstance(id);
    }
  };

  const toggleDay = (day: number) => {
    const newDays = formData.schedule_days.includes(day)
      ? formData.schedule_days.filter(d => d !== day)
      : [...formData.schedule_days, day].sort();
    setFormData({ ...formData, schedule_days: newDays, times_per_week: newDays.length });
  };

  if (selectedCategory) {
    return <CategoryView category={selectedCategory} onBack={() => setSelectedCategory(null)} />;
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
              <Sparkles size={22} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Mis Categorías</h1>
          </div>
          <p className={`text-sm font-medium ml-14 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Organiza todas las áreas de tu vida desde un solo lugar
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      {/* Resumen rápido de tipos */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(() => {
            const typeCounts: Record<string, number> = {};
            allCategories.forEach(c => {
              typeCounts[c.category_type] = (typeCounts[c.category_type] || 0) + 1;
            });
            return Object.entries(typeCounts).map(([type, count]) => (
              <div
                key={type}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {getCategoryIcon(type as WorkCategory, 14)}
                <span>{getCategoryLabel(type as WorkCategory)}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Grid de Categorías */}
      {allCategories.length === 0 ? (
        <div className={`p-12 rounded-2xl border-2 border-dashed text-center ${
          isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-300 bg-slate-50'
        }`}>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 w-fit mx-auto mb-4">
            <FolderKanban size={40} className={isDark ? 'text-indigo-400' : 'text-indigo-500'} />
          </div>
          <h3 className="text-xl font-black mb-2">Sin categorías aún</h3>
          <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Crea tu primera categoría para organizar materias, trabajo, gym, proyectos y más.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
          >
            <Plus size={18} />
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCategories.map(item => {
            const instance = profileInstances.find(ci => ci.id === item.id);
            if (!instance) return null;

            return (
              <div
                key={instance.id}
                onClick={() => setSelectedCategory(instance)}
                className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Color accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${instance.color}, ${instance.color}88)` }}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl text-white shadow-lg"
                        style={{ backgroundColor: instance.color }}
                      >
                        {getCategoryIcon(instance.category_type, 18)}
                      </div>
                      <div>
                        <h3 className="font-black text-base leading-tight">{instance.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                          isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {getCategoryLabel(instance.category_type)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(instance); }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                      >
                        <Edit2 size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(instance.id); }}
                        className="p-2 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule info */}
                  <div className={`space-y-2.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="flex items-center gap-2.5">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span className="font-medium capitalize">{instance.period_type}</span>
                      {instance.start_date && instance.end_date && (
                        <span className="text-xs opacity-70">
                          {new Date(instance.start_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })} - {new Date(instance.end_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="font-bold">{instance.schedule_start_time} - {instance.schedule_end_time}</span>
                    </div>
                  </div>

                  {/* Days pills */}
                  <div className="flex items-center gap-1.5 mt-4">
                    {DAYS.map((day, idx) => {
                      const isSelected = instance.schedule_days.includes(idx);
                      return (
                        <span
                          key={idx}
                          className={`w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                            isSelected
                              ? 'text-white shadow-sm'
                              : isDark
                              ? 'bg-slate-800/50 text-slate-600'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          style={isSelected ? { backgroundColor: instance.color } : {}}
                        >
                          {day.charAt(0)}
                        </span>
                      );
                    })}
                    <span className={`ml-auto text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {instance.times_per_week}x/sem
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <div className={`flex items-center justify-end mt-3 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-all ${
                    isDark ? 'text-indigo-400' : 'text-indigo-500'
                  }`}>
                    Ver detalles <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            {/* Modal header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <h3 className="text-xl font-black">
                  {editingInstance ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {editingInstance ? 'Modifica los detalles de tu categoría' : 'Configura una nueva área de tu vida'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tipo de Categoría */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tipo de Categoría
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['materia', 'trabajo', 'idioma', 'gym', 'proyecto', 'descanso'] as WorkCategory[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, category_type: type, color: getCategoryColor(type) })}
                      className={`p-3 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2 ${
                        formData.category_type === type
                          ? 'text-white shadow-lg border-transparent scale-[1.05]'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent'
                      }`}
                      style={formData.category_type === type ? { backgroundColor: getCategoryColor(type) } : {}}
                    >
                      {getCategoryIcon(type, 20)}
                      <span className="text-[10px]">{getCategoryLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Inglés B2, Matemáticas I, Freelance Dev"
                  className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500 placeholder:text-slate-600'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Color */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl border-0 cursor-pointer"
                  />
                  <div
                    className="flex-1 h-10 rounded-xl"
                    style={{ background: `linear-gradient(90deg, ${formData.color}, ${formData.color}66)` }}
                  />
                </div>
              </div>

              {/* Periodo */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Período
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['mensual', 'trimestral', 'semestral', 'anual', 'indefinido', 'custom'] as CategoryPeriodType[]).map(period => (
                    <button
                      key={period}
                      onClick={() => setFormData({ ...formData, period_type: period })}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                        formData.period_type === period
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fechas */}
              {formData.period_type !== 'indefinido' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium ${
                        isDark
                          ? 'bg-slate-800 border border-slate-700 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-medium ${
                        isDark
                          ? 'bg-slate-800 border border-slate-700 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Días de la semana */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Días ({formData.schedule_days.length} seleccionados)
                </label>
                <div className="flex gap-2">
                  {DAYS.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        formData.schedule_days.includes(index)
                          ? 'text-white shadow-lg'
                          : isDark
                          ? 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      style={formData.schedule_days.includes(index) ? { backgroundColor: formData.color } : {}}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.schedule_start_time}
                    onChange={(e) => setFormData({ ...formData, schedule_start_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-bold ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.schedule_end_time}
                    onChange={(e) => setFormData({ ...formData, schedule_end_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-bold ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
                >
                  {editingInstance ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-3.5 font-bold rounded-xl transition-colors ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
