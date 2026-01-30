/**
 * WEEKLY CALENDAR - Vista de calendario semanal
 * Muestra las categorías/materias en una cuadrícula de días x horas
 * Con navegación entre semanas
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyCalendarProps {
  theme?: 'dark' | 'light';
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ theme = 'dark' }) => {
  const { activeProfileId, categoryInstances, subjects } = useAppStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Generar array de horas (6 AM a 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22

  // Generar array de días de la semana actual
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Navegar semanas
  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Obtener todas las categorías activas
  const profileInstances = categoryInstances.filter(
    ci => ci.profile_id === activeProfileId && ci.is_active
  );

  // Función para obtener categorías en un día/hora específicos
  const getCategoriesForTimeSlot = (dayIndex: number, hour: number) => {
    const categories: Array<CategoryInstance & { duration: number }> = [];

    profileInstances.forEach(instance => {
      // Verificar si la categoría tiene horario para este día de la semana
      if (instance.schedule_days.includes(dayIndex)) {
        // Convertir horarios a minutos para comparación
        const [startHour, startMin] = instance.schedule_start_time.split(':').map(Number);
        const [endHour, endMin] = instance.schedule_end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const slotStartMinutes = hour * 60;
        const slotEndMinutes = (hour + 1) * 60;

        // Verificar si el bloque cae en esta hora
        if (startMinutes < slotEndMinutes && endMinutes > slotStartMinutes) {
          const durationInHours = (endMinutes - startMinutes) / 60;
          categories.push({ ...instance, duration: durationInHours });
        }
      }
    });

    return categories;
  };

  // Función para obtener el tamaño del bloque según su duración
  const getBlockHeight = (duration: number) => {
    // Cada hora = 80px de altura
    return `${duration * 80}px`;
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">Calendario Semanal</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {format(currentWeekStart, 'd MMM', { locale: es })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
            title="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToToday}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 ${
              isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Hoy
          </button>

          <button
            onClick={goToNextWeek}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
            title="Siguiente semana"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
        <div className="min-w-[800px]">
          {/* Header con días */}
          <div className="grid grid-cols-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}">
            {/* Columna de horas (vacía en header) */}
            <div className={`p-3 text-center font-bold text-xs ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              HORA
            </div>

            {/* Días de la semana */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={index}
                  className={`p-3 text-center ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-800/50'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="font-black text-xs uppercase tracking-wider">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className={`text-2xl font-black ${isToday ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid de horas */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`grid grid-cols-8 border-b ${isDark ? 'border-slate-800/30' : 'border-slate-200'}`}
              style={{ minHeight: '80px' }}
            >
              {/* Columna de hora */}
              <div className={`p-3 text-center font-bold text-sm ${isDark ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Celdas de días */}
              {weekDays.map((day, dayIndex) => {
                const categories = getCategoriesForTimeSlot((day.getDay() + 6) % 7, hour);

                return (
                  <div
                    key={dayIndex}
                    className={`relative p-1 ${isDark ? 'bg-slate-900/20 hover:bg-slate-800/30' : 'bg-white hover:bg-slate-50'} transition-colors`}
                  >
                    {categories.map((category, idx) => {
                      // Solo renderizar el bloque si esta es la primera hora del evento
                      const [catStartHour] = category.schedule_start_time.split(':').map(Number);
                      if (catStartHour !== hour) return null;

                      return (
                        <div
                          key={idx}
                          className="absolute inset-x-1 rounded-lg p-2 text-xs font-bold shadow-lg overflow-hidden"
                          style={{
                            backgroundColor: category.color,
                            height: getBlockHeight(category.duration),
                            top: '4px',
                            zIndex: 10
                          }}
                        >
                          <div className="text-white truncate">{category.name}</div>
                          <div className="text-white/70 text-[10px] mt-1">
                            {category.schedule_start_time} - {category.schedule_end_time}
                          </div>
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
    </div>
  );
};

export default WeeklyCalendar;
