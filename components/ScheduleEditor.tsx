/**
 * SCHEDULE EDITOR - Editor de horarios múltiples
 * Permite agregar diferentes horarios para cada día de la semana
 */
import React, { useState } from 'react';
import { soundService } from '../lib/soundService';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';

export interface ScheduleSlot {
  id: string;
  day_of_week: number; // 0=Domingo, 1=Lunes, ... 6=Sábado
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

interface ScheduleEditorProps {
  schedules: ScheduleSlot[];
  onChange: (schedules: ScheduleSlot[]) => void;
  theme?: 'dark' | 'light';
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  schedules,
  onChange,
  theme = 'dark'
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Lunes por defecto
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  const daysOfWeek = [
    { value: 1, label: 'Lun', fullLabel: 'Lunes' },
    { value: 2, label: 'Mar', fullLabel: 'Martes' },
    { value: 3, label: 'Mié', fullLabel: 'Miércoles' },
    { value: 4, label: 'Jue', fullLabel: 'Jueves' },
    { value: 5, label: 'Vie', fullLabel: 'Viernes' },
    { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
    { value: 0, label: 'Dom', fullLabel: 'Domingo' },
  ];

  const handleAddSchedule = () => {
    if (!startTime || !endTime) {
      alert('Por favor selecciona hora de inicio y fin');
      return;
    }

    if (startTime >= endTime) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    soundService.playSuccess();
    soundService.vibrate([30, 50, 30]);

    const newSchedule: ScheduleSlot = {
      id: `${Date.now()}-${Math.random()}`,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime
    };

    onChange([...schedules, newSchedule]);
  };

  const handleRemoveSchedule = (id: string) => {
    soundService.playClick();
    soundService.vibrate(20);
    onChange(schedules.filter(s => s.id !== id));
  };

  const getDayLabel = (dayOfWeek: number) => {
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day?.fullLabel || 'Desconocido';
  };

  // Agrupar horarios por día
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, ScheduleSlot[]>);

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-indigo-500" />
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
          Horarios de Clase
        </h3>
      </div>

      {/* Formulario de agregar horario */}
      <div className={`p-4 rounded-xl border ${
        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Selector de día */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              Día
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-lg font-medium text-sm ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {daysOfWeek.map(day => (
                <option key={day.value} value={day.value}>
                  {day.fullLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Hora inicio */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              Hora Inicio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg font-medium text-sm ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          {/* Hora fin */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              Hora Fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg font-medium text-sm ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          {/* Botón agregar */}
          <div className="flex items-end">
            <button
              onClick={handleAddSchedule}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de horarios agregados */}
      {schedules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400">
            {schedules.length} horario{schedules.length > 1 ? 's' : ''} agregado{schedules.length > 1 ? 's' : ''}
          </p>

          {/* Agrupar por día */}
          <div className="space-y-3">
            {daysOfWeek.map(day => {
              const daySchedules = groupedSchedules[day.value] || [];
              if (daySchedules.length === 0) return null;

              return (
                <div
                  key={day.value}
                  className={`p-3 rounded-lg border ${
                    theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-indigo-500">
                      {day.fullLabel}
                    </span>
                    <span className="text-xs text-slate-400">
                      {daySchedules.length} clase{daySchedules.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {daySchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-sm font-medium">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                          title="Eliminar horario"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje si no hay horarios */}
      {schedules.length === 0 && (
        <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-300'
        }`}>
          <Clock size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-400">
            No hay horarios agregados
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Agrega al menos un horario de clase
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;
