/**
 * Gestor de Horario de Trabajo - Motor Central de PomoSmart
 * Diseño limpio y compacto inspirado en Notion y Linear
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { WorkSchedule, WorkCategory } from '../types';
import {
  Clock, ChevronLeft, ChevronRight, Plus, X, BookOpen,
  Briefcase, Dumbbell, Languages, FolderKanban, Coffee, Calendar
} from 'lucide-react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6);
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0];

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

  const isDark = theme === 'dark';

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

  const profileSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  const profileSchedules = useMemo(() => {
    return workSchedules.filter(s => s.profile_id === activeProfileId && s.is_active);
  }, [workSchedules, activeProfileId]);

  const totalWeeklyHours = calculateWeeklyWorkHours();

  const getCategoryIcon = (category: WorkCategory) => {
    const icons = {
      'materia': <BookOpen size={14} />,
      'idioma': <Languages size={14} />,
      'trabajo': <Briefcase size={14} />,
      'gym': <Dumbbell size={14} />,
      'proyecto': <FolderKanban size={14} />,
      'descanso': <Coffee size={14} />,
      'otro': <Clock size={14} />
    };
    return icons[category] || icons.otro;
  };

  const getCategoryColorHex = (category: WorkCategory): string => {
    const colors = {
      'materia': '#6366F1',
      'idioma': '#A855F7',
      'trabajo': '#10B981',
      'gym': '#F97316',
      'proyecto': '#06B6D4',
      'descanso': '#F59E0B',
      'otro': '#64748B'
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

    let blockType: 'study' | 'work' | 'break' | 'other' = 'study';
    if (formData.category === 'trabajo') blockType = 'work';
    else if (formData.category === 'descanso') blockType = 'break';
    else if (formData.category === 'otro') blockType = 'other';

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

  // Category breakdown stats
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    profileSchedules.forEach(block => {
      const cat = block.category || 'otro';
      const [startH, startM] = block.start_time.split(':').map(Number);
      const [endH, endM] = block.end_time.split(':').map(Number);
      const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
      breakdown[cat] = (breakdown[cat] || 0) + hours;
    });
    return breakdown;
  }, [profileSchedules]);

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg">
            <Clock size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Horario de Trabajo</h1>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Define tu tiempo disponible por categorías
            </p>
          </div>
        </div>

        <div className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Horas/Semana</p>
          <p className="text-xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {totalWeeklyHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryBreakdown).map(([cat, hours]) => (
            <div
              key={cat}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                isDark ? 'bg-slate-800/80' : 'bg-white border border-slate-200'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getCategoryColorHex(cat as WorkCategory) }}
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                {getCategoryLabel(cat as WorkCategory)}
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {hours.toFixed(1)}h
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {profileSchedules.length === 0 && (
        <div className={`p-12 rounded-2xl border-2 border-dashed text-center ${
          isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-300 bg-slate-50'
        }`}>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 w-fit mx-auto mb-4">
            <Clock size={40} className={isDark ? 'text-purple-400' : 'text-purple-500'} />
          </div>
          <h3 className="text-xl font-black mb-2">Sin horarios definidos</h3>
          <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Haz clic en cualquier celda del calendario para agregar bloques de tiempo y organizar tu semana.
          </p>
        </div>
      )}

      {/* Week navigation */}
      <div className={`p-3 rounded-xl flex items-center justify-between ${
        isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        <button
          onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold">
            {format(currentWeekStart, "d MMM", { locale: es })} - {format(weekDays[6], "d MMM yyyy", { locale: es })}
          </p>
          {isCurrentWeek && (
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Semana Actual</span>
          )}
        </div>

        <button
          onClick={() => setCurrentWeekOffset(prev => prev + 1)}
          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Schedule grid */}
      <div className={`rounded-2xl overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Day headers */}
        <div className="grid border-b" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className={`p-2.5 text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Calendar size={14} className={`mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          {DAYS.map((day, index) => {
            const isToday = isSameDay(weekDays[index], new Date());
            return (
              <div
                key={day}
                className={`p-2.5 text-center border-l ${
                  isToday
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : isDark
                    ? 'bg-slate-800/30 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {day}
                </div>
                <div className={`text-sm font-black ${isToday ? 'text-white' : ''}`}>
                  {format(weekDays[index], 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
          {HOURS.map(hour => (
            <div
              key={hour}
              className={`grid border-b last:border-0 ${isDark ? 'border-slate-800/40' : 'border-slate-100'}`}
              style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
            >
              <div className={`p-2 text-center text-[11px] font-bold ${
                isDark ? 'bg-slate-800/30 text-slate-500' : 'bg-slate-50/50 text-slate-400'
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
                    className={`relative p-1 min-h-[52px] border-l transition-all ${
                      isDark ? 'border-slate-800/30' : 'border-slate-100'
                    } ${
                      hasBlocks
                        ? ''
                        : `cursor-pointer ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-indigo-50/50'}`
                    }`}
                  >
                    {!hasBlocks && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus size={12} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
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
                          onClick={(e) => { e.stopPropagation(); handleEditBlock(block); }}
                          className="relative p-2 rounded-lg mb-0.5 text-white text-[10px] font-bold cursor-pointer hover:scale-[1.02] transition-transform group shadow-sm overflow-hidden"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="flex items-center gap-1.5">
                            {block.category && getCategoryIcon(block.category)}
                            <span className="truncate">{getBlockDisplay(block)}</span>
                          </div>
                          <div className="text-[9px] opacity-70 mt-0.5">
                            {block.start_time.slice(0, 5)}-{block.end_time.slice(0, 5)}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                            className="absolute -top-0.5 -right-0.5 p-1 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={8} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            {/* Modal header */}
            <div className={`flex items-center justify-between p-5 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-black">
                {editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingBlock(null); }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Category */}
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Categoría
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['materia', 'trabajo', 'idioma', 'gym', 'proyecto', 'descanso'] as WorkCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        formData.category === cat
                          ? 'text-white shadow-lg'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                      style={formData.category === cat ? { backgroundColor: getCategoryColorHex(cat) } : {}}
                    >
                      {getCategoryIcon(cat)}
                      <span className="text-[9px]">{getCategoryLabel(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject selector */}
              {formData.category === 'materia' && profileSubjects.length > 0 && (
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Materia
                  </label>
                  <select
                    value={formData.subject_id || ''}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-medium ${
                      isDark ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  >
                    {profileSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              {formData.category !== 'materia' && (
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nombre o descripción del bloque"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-medium ${
                      isDark ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              )}

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-bold ${
                      isDark ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-bold ${
                      isDark ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveBlock}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
                >
                  {editingBlock ? 'Guardar Cambios' : 'Crear Bloque'}
                </button>
                <button
                  onClick={() => { setShowModal(false); setEditingBlock(null); }}
                  className={`px-5 py-3 text-sm font-bold rounded-xl transition-colors ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
