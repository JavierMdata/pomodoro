/**
 * Componente de Horario de Trabajo Semanal
 * Motor central de la app - Formato Venezuela (días arriba, horas a la derecha)
 * Permite navegar entre semanas y definir bloques de trabajo/estudio
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { WorkSchedule, WorkBlockType } from '../types';
import {
  Clock, Plus, Trash2, ChevronLeft, ChevronRight, Calendar,
  Briefcase, BookOpen, Dumbbell, Languages, Coffee, CheckSquare
} from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface BlockFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  block_type: WorkBlockType;
  description: string;
}

const WorkScheduleManager: React.FC = () => {
  const { theme, activeProfileId, workSchedules, addWorkSchedule, updateWorkSchedule, deleteWorkSchedule, calculateWeeklyWorkHours } = useAppStore();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [editingBlock, setEditingBlock] = useState<WorkSchedule | null>(null);

  const [formData, setFormData] = useState<BlockFormData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    block_type: 'study',
    description: ''
  });

  // Calcular semana actual
  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const baseWeek = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
    return addWeeks(baseWeek, currentWeekOffset);
  }, [currentWeekOffset]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    });
  }, [currentWeekStart]);

  // Filtrar horarios del perfil activo
  const profileSchedules = useMemo(() => {
    return workSchedules.filter(s => s.profile_id === activeProfileId && s.is_active);
  }, [workSchedules, activeProfileId]);

  // Calcular horas totales por semana
  const totalWeeklyHours = useMemo(() => {
    return calculateWeeklyWorkHours();
  }, [profileSchedules]);

  const getBlockTypeIcon = (type: WorkBlockType) => {
    const icons = {
      'study': <BookOpen size={14} />,
      'work': <Briefcase size={14} />,
      'break': <Coffee size={14} />,
      'other': <CheckSquare size={14} />
    };
    return icons[type] || icons.other;
  };

  const getBlockTypeColor = (type: WorkBlockType) => {
    const colors = {
      'study': 'bg-indigo-500',
      'work': 'bg-emerald-500',
      'break': 'bg-amber-500',
      'other': 'bg-slate-500'
    };
    return colors[type] || colors.other;
  };

  const getBlockTypeLabel = (type: WorkBlockType) => {
    const labels = {
      'study': 'Estudio',
      'work': 'Trabajo',
      'break': 'Descanso',
      'other': 'Otro'
    };
    return labels[type] || type;
  };

  const handleCellClick = (dayIndex: number, hour: number) => {
    setSelectedSlot({ day: dayIndex, hour });
    setFormData({
      day_of_week: dayIndex,
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
      block_type: 'study',
      description: ''
    });
    setEditingBlock(null);
    setShowAddModal(true);
  };

  const handleEditBlock = (block: WorkSchedule) => {
    setEditingBlock(block);
    setFormData({
      day_of_week: block.day_of_week,
      start_time: block.start_time,
      end_time: block.end_time,
      block_type: block.block_type,
      description: block.description || ''
    });
    setShowAddModal(true);
  };

  const handleSaveBlock = async () => {
    if (!activeProfileId) return;

    if (editingBlock) {
      await updateWorkSchedule(editingBlock.id, formData);
    } else {
      await addWorkSchedule({
        ...formData,
        profile_id: activeProfileId,
        is_active: true
      });
    }

    setShowAddModal(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('¿Eliminar este bloque de horario?')) {
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

  const isCurrentWeek = currentWeekOffset === 0;

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Horario de Trabajo</h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold mt-1`}>
              Motor central: Define tu tiempo disponible y la app se ajusta automáticamente
            </p>
          </div>
        </div>

        {/* Horas totales */}
        <div className={`px-6 py-4 rounded-2xl ${
          theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
        }`}>
          <p className="text-sm font-bold text-slate-400 mb-1">TOTAL SEMANAL</p>
          <p className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalWeeklyHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Navegación de semanas */}
      <div className={`p-4 rounded-2xl flex items-center justify-between ${
        theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        <button
          onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          className={`p-3 rounded-xl transition-all hover:scale-105 ${
            theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <p className="text-lg font-black">
            {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(weekDays[6], "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          {isCurrentWeek && (
            <span className="text-sm font-bold text-indigo-500">Semana Actual</span>
          )}
          {currentWeekOffset < 0 && (
            <span className="text-sm font-bold text-slate-400">
              {Math.abs(currentWeekOffset)} {Math.abs(currentWeekOffset) === 1 ? 'semana atrás' : 'semanas atrás'}
            </span>
          )}
          {currentWeekOffset > 0 && (
            <span className="text-sm font-bold text-emerald-500">
              En {currentWeekOffset} {currentWeekOffset === 1 ? 'semana' : 'semanas'}
            </span>
          )}
        </div>

        <button
          onClick={() => setCurrentWeekOffset(prev => prev + 1)}
          className={`p-3 rounded-xl transition-all hover:scale-105 ${
            theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendario de horario (Días arriba, Horas a la derecha) */}
      <div className={`rounded-2xl overflow-hidden border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Header con días */}
        <div className="grid grid-cols-8 border-b border-slate-800">
          <div className={`p-4 font-bold text-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            Hora
          </div>
          {DAYS.map((day, index) => {
            const isToday = isSameDay(weekDays[index], new Date());
            return (
              <div
                key={day}
                className={`p-4 font-bold text-center ${
                  isToday
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-800'
                    : 'bg-slate-100'
                }`}
              >
                <div>{day}</div>
                <div className="text-xs font-normal mt-1">
                  {format(weekDays[index], 'd MMM', { locale: es })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filas de horas */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-800">
              {/* Columna de hora */}
              <div className={`p-3 font-bold text-center ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Celdas por día */}
              {[1, 2, 3, 4, 5, 6, 0].map((dayIndex, colIndex) => {
                const blocks = getBlocksForSlot(dayIndex, hour);
                const hasBlocks = blocks.length > 0;

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    onClick={() => !hasBlocks && handleCellClick(dayIndex, hour)}
                    className={`relative p-2 min-h-[60px] transition-all cursor-pointer ${
                      hasBlocks
                        ? ''
                        : theme === 'dark'
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {!hasBlocks && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-slate-400" />
                      </div>
                    )}

                    {blocks.map(block => (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBlock(block);
                        }}
                        className={`relative p-2 rounded-lg mb-1 ${getBlockTypeColor(block.block_type)} text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer group`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getBlockTypeIcon(block.block_type)}
                          <span className="truncate">{block.description || getBlockTypeLabel(block.block_type)}</span>
                        </div>
                        <div className="text-[10px] opacity-80">
                          {block.start_time} - {block.end_time}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar/editar bloque */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg mx-4 p-6 rounded-2xl shadow-2xl animate-in zoom-in duration-300 ${
            theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <h3 className="text-2xl font-black mb-6">
              {editingBlock ? 'Editar Bloque' : 'Nuevo Bloque de Horario'}
            </h3>

            <div className="space-y-4">
              {/* Tipo de bloque */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Tipo de Actividad</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['study', 'work', 'break', 'other'] as WorkBlockType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, block_type: type })}
                      className={`p-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                        formData.block_type === type
                          ? `${getBlockTypeColor(type)} text-white`
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {getBlockTypeIcon(type)}
                      {getBlockTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Programación, Gym, Inglés..."
                  className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveBlock}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  {editingBlock ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBlock(null);
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkScheduleManager;
