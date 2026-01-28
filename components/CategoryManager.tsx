/**
 * GESTOR CENTRAL DE CATEGORÍAS - Life Command Center
 * Desde aquí el usuario crea TODAS las categorías que se convierten en secciones de la app
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { WorkCategory, CategoryPeriodType, CategoryInstance } from '../types';
import {
  Plus, BookOpen, Languages, Briefcase, Dumbbell, FolderKanban,
  Clock, Calendar, Edit2, Trash2, CheckCircle, X
} from 'lucide-react';
import CategoryView from './CategoryView';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const CategoryManager: React.FC = () => {
  const { theme, activeProfileId, categoryInstances, addCategoryInstance, updateCategoryInstance, deleteCategoryInstance } = useAppStore();

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

  const profileInstances = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);

  const getCategoryIcon = (type: WorkCategory, size = 24) => {
    const icons = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Clock size={size} />,
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

    if (editingInstance) {
      await updateCategoryInstance(editingInstance.id, instanceData);
    } else {
      await addCategoryInstance(instanceData);
    }

    setShowModal(false);
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

  // Si hay categoría seleccionada, mostrar su vista
  if (selectedCategory) {
    return <CategoryView category={selectedCategory} onBack={() => setSelectedCategory(null)} />;
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Life Command Center</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Crea y gestiona todas tus categorías de vida desde un solo lugar
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileInstances.map(instance => (
          <div
            key={instance.id}
            onClick={() => setSelectedCategory(instance)}
            className={`p-5 rounded-xl border transition-all hover:scale-105 cursor-pointer ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
            style={{ borderLeftWidth: '4px', borderLeftColor: instance.color }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: instance.color }}
                >
                  {getCategoryIcon(instance.category_type, 20)}
                </div>
                <div>
                  <h3 className="font-black text-lg">{instance.name}</h3>
                  <p className="text-xs text-slate-400">{getCategoryLabel(instance.category_type)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(instance); }}
                  className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(instance.id); }}
                  className="p-2 rounded-lg hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="font-medium">{instance.period_type}</span>
                {instance.start_date && instance.end_date && (
                  <span className="text-xs text-slate-400">
                    ({new Date(instance.start_date).toLocaleDateString()} - {new Date(instance.end_date).toLocaleDateString()})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>{instance.schedule_start_time} - {instance.schedule_end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-slate-400" />
                <span>{instance.times_per_week}x por semana</span>
              </div>
              <div className="flex gap-1 mt-2">
                {instance.schedule_days.map(day => (
                  <span
                    key={day}
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: instance.color, color: 'white' }}
                  >
                    {DAYS[day]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <h3 className="text-2xl font-black mb-6">
              {editingInstance ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <div className="space-y-5">
              {/* Tipo de Categoría */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Tipo de Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['materia', 'trabajo', 'idioma', 'gym', 'proyecto', 'descanso'] as WorkCategory[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, category_type: type, color: getCategoryColor(type) })}
                      className={`p-3 rounded-lg font-bold flex flex-col items-center gap-2 transition-all ${
                        formData.category_type === type
                          ? 'text-white shadow-lg'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      style={formData.category_type === type ? { backgroundColor: getCategoryColor(type) } : {}}
                    >
                      {getCategoryIcon(type, 20)}
                      <span className="text-xs">{getCategoryLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Inglés B2, Matemáticas I, Freelance Dev"
                  className={`w-full px-4 py-3 rounded-lg outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Periodo */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Periodo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mensual', 'trimestral', 'semestral', 'anual', 'indefinido', 'custom'] as CategoryPeriodType[]).map(period => (
                    <button
                      key={period}
                      onClick={() => setFormData({ ...formData, period_type: period })}
                      className={`p-2 rounded-lg text-sm font-bold transition-all ${
                        formData.period_type === period
                          ? 'bg-indigo-600 text-white'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fechas (si no es indefinido) */}
              {formData.period_type !== 'indefinido' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border border-slate-700 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border border-slate-700 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Días de la semana */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Días de la Semana ({formData.schedule_days.length} seleccionados)
                </label>
                <div className="flex gap-2">
                  {DAYS.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        formData.schedule_days.includes(index)
                          ? 'text-white shadow-lg'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      style={formData.schedule_days.includes(index) ? { backgroundColor: formData.color } : {}}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.schedule_start_time}
                    onChange={(e) => setFormData({ ...formData, schedule_start_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.schedule_end_time}
                    onChange={(e) => setFormData({ ...formData, schedule_end_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  {editingInstance ? 'Actualizar' : 'Crear Categoría'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-3 font-bold rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
