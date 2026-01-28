/**
 * Gestor de Horario de Trabajo - Motor Central de PomoSmart
 * Permite definir bloques de tiempo disponibles y asociarlos con materias/actividades
 * La app distribuye automáticamente el tiempo según las prioridades
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { WorkSchedule, WorkCategory } from '../types';
import {
  Clock, ChevronLeft, ChevronRight, Plus, X, BookOpen,
  Briefcase, Dumbbell, Languages, FolderKanban, Coffee
} from 'lucide-react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6:00 - 20:00
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0]; // Lun=1, ..., Dom=0

interface BlockFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  category: WorkCategory;
  subject_id?: string;
  description: string;
}

const WorkScheduleManager: React.FC = () => {
  const {
    theme,
    activeProfileId,
    workSchedules,
    subjects,
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    calculateWeeklyWorkHours
  } = useAppStore();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<WorkSchedule | null>(null);
  const [formData, setFormData] = useState<BlockFormData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '11:00',
    category: 'materia',
    subject_id: undefined,
    description: ''
  });

  // Calcular semana actual
  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const baseWeek = startOfWeek(today, { weekStartsOn: 1 });
    return addWeeks(baseWeek, currentWeekOffset);
  }, [currentWeekOffset]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    });
  }, [currentWeekStart]);

  // Materias del perfil activo
  const profileSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  // Horarios activos del perfil
  const profileSchedules = useMemo(() => {
    return workSchedules.filter(s => s.profile_id === activeProfileId && s.is_active);
  }, [workSchedules, activeProfileId]);

  // Total de horas semanales
  const totalWeeklyHours = calculateWeeklyWorkHours();

  const getCategoryIcon = (category: WorkCategory) => {
    const icons = {
      'materia': <BookOpen size={16} />,
      'idioma': <Languages size={16} />,
      'trabajo': <Briefcase size={16} />,
      'gym': <Dumbbell size={16} />,
      'proyecto': <FolderKanban size={16} />,
      'descanso': <Coffee size={16} />,
      'otro': <Clock size={16} />
    };
    return icons[category] || icons.otro;
  };

  const getCategoryColorHex = (category: WorkCategory): string => {
    const colors = {
      'materia': '#6366F1',    // indigo-500
      'idioma': '#A855F7',     // purple-500
      'trabajo': '#10B981',    // emerald-500
      'gym': '#F97316',        // orange-500
      'proyecto': '#06B6D4',   // cyan-500
      'descanso': '#F59E0B',   // amber-500
      'otro': '#64748B'        // slate-500
    };
    return colors[category] || colors.otro;
  };

  const getCategoryColorClass = (category: WorkCategory): string => {
    const colors = {
      'materia': 'bg-indigo-500',
      'idioma': 'bg-purple-500',
      'trabajo': 'bg-emerald-500',
      'gym': 'bg-orange-500',
      'proyecto': 'bg-cyan-500',
      'descanso': 'bg-amber-500',
      'otro': 'bg-slate-500'
    };
    return colors[category] || colors.otro;
  };

  const getCategoryLabel = (category: WorkCategory) => {
    const labels = {
      'materia': 'Materia',
      'idioma': 'Idioma',
      'trabajo': 'Trabajo',
      'gym': 'Gym',
      'proyecto': 'Proyecto',
      'descanso': 'Descanso',
      'otro': 'Otro'
    };
    return labels[category] || category;
  };

  const handleCellClick = (dayIndex: number, hour: number) => {
    setFormData({
      day_of_week: dayIndex,
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 2).toString().padStart(2, '0')}:00`,
      category: 'materia',
      subject_id: profileSubjects[0]?.id,
      description: ''
    });
    setEditingBlock(null);
    setShowModal(true);
  };

  const handleEditBlock = (block: WorkSchedule) => {
    setEditingBlock(block);
    setFormData({
      day_of_week: block.day_of_week,
      start_time: block.start_time,
      end_time: block.end_time,
      category: block.category || 'otro',
      subject_id: block.subject_id,
      description: block.description || ''
    });
    setShowModal(true);
  };

  const handleSaveBlock = async () => {
    if (!activeProfileId) return;

    // Determinar block_type según categoría
    let blockType: 'study' | 'work' | 'break' | 'other' = 'study';
    if (formData.category === 'trabajo') {
      blockType = 'work';
    } else if (formData.category === 'descanso') {
      blockType = 'break';
    } else if (formData.category === 'otro') {
      blockType = 'other';
    }

    const blockData = {
      ...formData,
      profile_id: activeProfileId,
      is_active: true,
      block_type: blockType
    };

    if (editingBlock) {
      await updateWorkSchedule(editingBlock.id, blockData);
    } else {
      await addWorkSchedule(blockData);
    }

    setShowModal(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('¿Eliminar este bloque?')) {
      await deleteWorkSchedule(blockId);
    }
  };

  const getBlocksForSlot = (dayIndex: number, hour: number) => {
    return profileSchedules.filter(block => {
      if (block.day_of_week !== dayIndex) return false;
      const [startHour] = block.start_time.split(':').map(Number);
      const [endHour] = block.end_time.split(':').map(Number);
      return hour >= startHour && hour < endHour;
    });
  };

  const getBlockDisplay = (block: WorkSchedule) => {
    if (block.subject_id) {
      const subject = profileSubjects.find(s => s.id === block.subject_id);
      return subject?.name || block.description || 'Sin nombre';
    }
    return block.description || getCategoryLabel(block.category || 'otro');
  };

  const isCurrentWeek = currentWeekOffset === 0;

  return (
    <div className={`max-w-7xl mx-auto space-y-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Horario de Trabajo</h1>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Define tu tiempo disponible por categorías
            </p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-xl ${
          theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
        }`}>
          <p className="text-xs font-bold text-slate-400">HORAS/SEMANA</p>
          <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalWeeklyHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Leyenda de categorías */}
      <div className={`p-3 rounded-xl ${
        theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        <p className="text-xs font-bold text-slate-400 mb-2">CATEGORÍAS DISPONIBLES:</p>
        <div className="flex flex-wrap gap-2">
          {(['materia', 'trabajo', 'idioma', 'gym', 'proyecto', 'descanso'] as WorkCategory[]).map(cat => (
            <div
              key={cat}
              className={`${getCategoryColorClass(cat)} px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1.5`}
            >
              {getCategoryIcon(cat)}
              {getCategoryLabel(cat)}
            </div>
          ))}
        </div>
      </div>

      {/* Navegación de semanas */}
      <div className={`p-3 rounded-xl flex items-center justify-between ${
        theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        <button
          onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold">
            {format(currentWeekStart, "d MMM", { locale: es })} - {format(weekDays[6], "d MMM yyyy", { locale: es })}
          </p>
          {isCurrentWeek && (
            <span className="text-xs font-medium text-indigo-500">Semana Actual</span>
          )}
        </div>

        <button
          onClick={() => setCurrentWeekOffset(prev => prev + 1)}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendario compacto */}
      <div className={`rounded-xl overflow-hidden border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        {/* Header de días */}
        <div className="grid grid-cols-8 border-b border-slate-700">
          <div className={`p-2 text-xs font-bold text-center ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            Hora
          </div>
          {DAYS.map((day, index) => {
            const isToday = isSameDay(weekDays[index], new Date());
            return (
              <div
                key={day}
                className={`p-2 text-xs font-bold text-center ${
                  isToday
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-800'
                    : 'bg-slate-100'
                }`}
              >
                <div>{day}</div>
                <div className="text-[10px] font-normal opacity-70">
                  {format(weekDays[index], 'd', { locale: es })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filas de horas */}
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-800 last:border-0">
              <div className={`p-2 text-xs font-bold text-center ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {DAY_INDICES.map((dayIndex) => {
                const blocks = getBlocksForSlot(dayIndex, hour);
                const hasBlocks = blocks.length > 0;

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onClick={() => !hasBlocks && handleCellClick(dayIndex, hour)}
                    className={`relative p-1 min-h-[50px] transition-all ${
                      hasBlocks
                        ? ''
                        : `cursor-pointer ${
                            theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
                          }`
                    }`}
                  >
                    {!hasBlocks && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus size={14} className="text-slate-400" />
                      </div>
                    )}

                    {blocks.map(block => {
                      const subjectColor = block.subject_id
                        ? profileSubjects.find(s => s.id === block.subject_id)?.color
                        : null;

                      const bgColor = subjectColor || getCategoryColorHex(block.category || 'otro');

                      return (
                        <div
                          key={block.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBlock(block);
                          }}
                          className="relative p-1.5 rounded-lg mb-0.5 text-white text-[10px] font-bold cursor-pointer hover:scale-105 transition-transform group shadow-sm"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="flex items-center gap-1">
                            {block.category && getCategoryIcon(block.category)}
                            <span className="truncate">{getBlockDisplay(block)}</span>
                          </div>
                          <div className="text-[9px] opacity-70">
                            {block.start_time.slice(0, 5)}-{block.end_time.slice(0, 5)}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="absolute -top-1 -right-1 p-0.5 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-5 rounded-xl shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <h3 className="text-xl font-black mb-4">
              {editingBlock ? 'Editar Bloque' : 'Nuevo Bloque de Horario'}
            </h3>

            <div className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['materia', 'trabajo', 'idioma', 'gym', 'proyecto', 'descanso'] as WorkCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-3 rounded-lg text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                        formData.category === cat
                          ? `${getCategoryColorClass(cat)} text-white shadow-lg`
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span className="text-xs">{getCategoryLabel(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Materia (si categoría es materia) */}
              {formData.category === 'materia' && profileSubjects.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Selecciona la Materia</label>
                  <select
                    value={formData.subject_id || ''}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  >
                    {profileSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  {formData.category === 'trabajo' && '🏢 Empresa o Freelance'}
                  {formData.category === 'descanso' && '☕ Tipo de descanso'}
                  {formData.category === 'gym' && '🏋️ Descripción del entrenamiento'}
                  {formData.category === 'idioma' && '🌐 Nombre del curso/idioma'}
                  {formData.category === 'proyecto' && '📁 Nombre del proyecto'}
                  {formData.category !== 'trabajo' && formData.category !== 'descanso' &&
                   formData.category !== 'gym' && formData.category !== 'idioma' &&
                   formData.category !== 'proyecto' && formData.category !== 'materia' && 'Descripción'}
                  {formData.category !== 'materia' && ' (opcional)'}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    formData.category === 'trabajo'
                      ? 'Ej: Google, Freelance Dev, Consultora ABC'
                      : formData.category === 'descanso'
                      ? 'Ej: Almuerzo, Merienda, Coffee break'
                      : formData.category === 'gym'
                      ? 'Ej: Rutina pecho, Cardio, Fullbody'
                      : formData.category === 'idioma'
                      ? 'Ej: Inglés B2, Francés principiante'
                      : formData.category === 'proyecto'
                      ? 'Ej: App móvil, Tesis, Startup'
                      : 'Descripción del bloque...'
                  }
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">⏰ Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">⏰ Hora Fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveBlock}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  {editingBlock ? '✅ Actualizar' : '➕ Guardar Bloque'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingBlock(null);
                  }}
                  className={`px-6 py-3 text-sm font-bold rounded-lg transition-colors ${
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

export default WorkScheduleManager;
