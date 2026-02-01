/**
 * WEEKLY CALENDAR - Vista de calendario semanal MEJORADA
 * Muestra TODAS las actividades: materias, trabajo, gym, proyectos
 * Días arriba (Lun-Dom), horas a la izquierda (6 AM - 10 PM)
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance, Subject, ClassSchedule } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyCalendarProps {
  theme?: 'dark' | 'light';
}

interface CalendarEvent {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'subject' | 'category';
  categoryType?: string;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ theme = 'dark' }) => {
  const { activeProfileId, categoryInstances, subjects, classSchedule } = useAppStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Horas del día (6 AM a 10 PM = 17 horas)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  // Días de la semana (Lun a Dom)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Navegación
  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Obtener TODAS las actividades (materias + categorías)
  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const profileCategories = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);

  // Función para obtener eventos en una celda específica (día, hora)
  const getEventsForTimeSlot = (dayIndex: number, hour: number): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // 1. AGREGAR MATERIAS (desde class_schedule)
    profileSubjects.forEach(subject => {
      const schedules = classSchedule.filter(cs => cs.subject_id === subject.id && cs.day_of_week === dayIndex);

      schedules.forEach(schedule => {
        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const slotStart = hour * 60;
        const slotEnd = (hour + 1) * 60;

        // Verificar si el evento cae en esta hora
        if (startMinutes < slotEnd && endMinutes > slotStart) {
          const durationHours = (endMinutes - startMinutes) / 60;
          events.push({
            id: subject.id,
            name: subject.name,
            color: subject.color,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            duration: durationHours,
            type: 'subject',
            categoryType: 'materia'
          });
        }
      });
    });

    // 2. AGREGAR CATEGORÍAS (trabajo, gym, proyectos, etc.)
    profileCategories.forEach(category => {
      if (category.schedule_days.includes(dayIndex)) {
        const [startHour, startMin] = category.schedule_start_time.split(':').map(Number);
        const [endHour, endMin] = category.schedule_end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const slotStart = hour * 60;
        const slotEnd = (hour + 1) * 60;

        if (startMinutes < slotEnd && endMinutes > slotStart) {
          const durationHours = (endMinutes - startMinutes) / 60;
          events.push({
            id: category.id,
            name: category.name,
            color: category.color,
            startTime: category.schedule_start_time,
            endTime: category.schedule_end_time,
            duration: durationHours,
            type: 'category',
            categoryType: category.category_type
          });
        }
      }
    });

    return events;
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">Mi Semana</h2>
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
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Hoy
          </button>

          <button
            onClick={goToNextWeek}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendario Grid */}
      <div className={`overflow-auto rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'} shadow-2xl`}>
        <div className="min-w-[1000px]">
          {/* HEADER: Días de la semana ARRIBA */}
          <div className={`sticky top-0 z-20 grid grid-cols-8 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            {/* Esquina superior izquierda (vacía) */}
            <div className={`p-4 text-center font-black text-xs ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <CalendarIcon size={16} className="mx-auto text-slate-400" />
            </div>

            {/* DÍAS ARRIBA: Lun, Mar, Mié, Jue, Vie, Sáb, Dom */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={index}
                  className={`p-4 text-center transition-all ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-800/30'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-white' : 'text-slate-400'}`}>
                    {dayNames[index]}
                  </div>
                  <div className={`text-3xl font-black mt-1 ${isToday ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* GRID: HORAS A LA IZQUIERDA + CELDAS */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`grid grid-cols-8 border-b ${isDark ? 'border-slate-800/30' : 'border-slate-200'}`}
              style={{ minHeight: '100px' }}
            >
              {/* HORA A LA IZQUIERDA */}
              <div className={`p-3 text-center font-black text-lg sticky left-0 z-10 ${
                isDark ? 'bg-slate-800/50 text-slate-300 border-r border-slate-800' : 'bg-slate-100 text-slate-700 border-r border-slate-200'
              }`}>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* CELDAS DE DÍAS (7 columnas) */}
              {weekDays.map((day, dayIndex) => {
                const events = getEventsForTimeSlot(dayIndex, hour);

                return (
                  <div
                    key={dayIndex}
                    className={`relative p-1 border-r last:border-r-0 ${
                      isDark ? 'bg-slate-900/20 hover:bg-slate-800/30 border-slate-800/30' : 'bg-white hover:bg-slate-50 border-slate-200'
                    } transition-colors`}
                  >
                    {events.map((event) => {
                      // Solo renderizar si esta es la primera celda del evento
                      const [eventStartHour] = event.startTime.split(':').map(Number);
                      if (eventStartHour !== hour) return null;

                      return (
                        <div
                          key={event.id}
                          className="absolute inset-x-1 rounded-xl p-3 text-xs font-bold shadow-xl overflow-hidden border-2 border-white/20 backdrop-blur-sm"
                          style={{
                            backgroundColor: event.color,
                            height: `${event.duration * 100}px`,
                            top: '4px',
                            zIndex: 15
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="text-white font-black truncate flex-1">{event.name}</div>
                            {event.type === 'subject' && <BookOpen size={12} className="text-white/80 flex-shrink-0" />}
                          </div>
                          <div className="text-white/90 text-[10px] font-bold mt-1">
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="text-white/70 text-[9px] font-bold uppercase mt-1 tracking-wider">
                            {event.categoryType}
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

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500"></div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Materias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Trabajo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Gym</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Proyectos</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
