/**
 * WEEKLY CALENDAR - Vista de calendario semanal mejorada
 * Diseño limpio inspirado en Google Calendar y Fantastical
 * Con indicador de hora actual y eventos bien estilizados
 */
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance, Subject, ClassSchedule } from '../types';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen,
  Briefcase, Dumbbell, Languages, FolderKanban, Coffee, Clock
} from 'lucide-react';
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
  const { activeProfileId, categoryInstances, subjects, schedules } = useAppStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = Math.floor(currentMinutes / 60);
      const scrollTarget = Math.max(0, (currentHour - 7) * 64);
      scrollRef.current.scrollTop = scrollTarget;
    }
  }, []);

  // Hours and days
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const profileSubjects = (subjects || []).filter(s => s.profile_id === activeProfileId);
  const profileCategories = (categoryInstances || []).filter(ci => ci.profile_id === activeProfileId && ci.is_active);
  const classSchedules = schedules || [];

  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getCategoryIcon = (type: string, size = 12) => {
    const icons: Record<string, any> = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Coffee size={size} />,
      'otro': <Clock size={size} />
    };
    return icons[type] || icons.otro;
  };

  // Get events for a specific day (all at once, not per slot)
  const getEventsForDay = (dayIndex: number): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const seenIds = new Set<string>();

    // Subjects
    profileSubjects.forEach(subject => {
      const subjectSchedules = classSchedules.filter(cs => cs.subject_id === subject.id && cs.day_of_week === dayIndex);
      subjectSchedules.forEach(schedule => {
        const key = `${subject.id}-${schedule.start_time}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);
        const durationHours = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;

        events.push({
          id: key,
          name: subject.name,
          color: subject.color,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          duration: durationHours,
          type: 'subject',
          categoryType: 'materia'
        });
      });
    });

    // Categories
    profileCategories.forEach(category => {
      if (category.schedule_days.includes(dayIndex)) {
        const key = `cat-${category.id}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const [startHour, startMin] = category.schedule_start_time.split(':').map(Number);
        const [endHour, endMin] = category.schedule_end_time.split(':').map(Number);
        const durationHours = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;

        events.push({
          id: key,
          name: category.name,
          color: category.color,
          startTime: category.schedule_start_time,
          endTime: category.schedule_end_time,
          duration: durationHours,
          type: 'category',
          categoryType: category.category_type
        });
      }
    });

    return events;
  };

  const isDark = theme === 'dark';
  const ROW_HEIGHT = 64; // px per hour
  const FIRST_HOUR = 6;

  // Calculate position for an event
  const getEventPosition = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const top = (startHour - FIRST_HOUR) * ROW_HEIGHT + (startMin / 60) * ROW_HEIGHT;
    const height = event.duration * ROW_HEIGHT;
    return { top, height: Math.max(height, 24) };
  };

  // Current time indicator position
  const currentTimeTop = ((currentMinutes / 60) - FIRST_HOUR) * ROW_HEIGHT;
  const showCurrentTime = isCurrentWeek && currentMinutes >= FIRST_HOUR * 60 && currentMinutes <= 23 * 60;
  const todayDayIndex = weekDays.findIndex(d => isSameDay(d, new Date()));

  return (
    <div className={`w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black">Mi Semana</h2>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {format(currentWeekStart, 'd MMM', { locale: es })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className={`p-2 rounded-xl transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105 ${
              isCurrentWeek
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={goToNextWeek}
            className={`p-2 rounded-xl transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {/* Day headers */}
        <div className={`grid border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
          style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
        >
          <div className={`p-3 flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <CalendarIcon size={14} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
          </div>
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={index}
                className={`p-3 text-center transition-all ${
                  isToday
                    ? 'bg-indigo-600'
                    : isDark
                    ? 'bg-slate-900'
                    : 'bg-slate-50'
                }`}
              >
                <div className={`text-[10px] font-black uppercase tracking-wider ${
                  isToday ? 'text-indigo-200' : isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {dayNames[index]}
                </div>
                <div className={`text-xl font-black mt-0.5 ${
                  isToday ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={scrollRef} className="overflow-auto max-h-[500px] scrollbar-thin relative"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="relative" style={{ minWidth: '700px' }}>
            {/* Hour rows (just for grid lines) */}
            <div className="relative">
              {hours.map(hour => (
                <div
                  key={hour}
                  className={`grid border-b ${isDark ? 'border-slate-800/40' : 'border-slate-100'}`}
                  style={{ gridTemplateColumns: '60px repeat(7, 1fr)', height: `${ROW_HEIGHT}px` }}
                >
                  <div className={`flex items-start justify-center pt-1 text-[11px] font-bold sticky left-0 z-10 ${
                    isDark ? 'bg-slate-900/90 text-slate-500' : 'bg-white/90 text-slate-400'
                  }`}>
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {weekDays.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`border-l ${isDark ? 'border-slate-800/30' : 'border-slate-100'}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Events overlay */}
            <div className="absolute inset-0" style={{ marginLeft: '60px' }}>
              <div className="grid h-full" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {weekDays.map((_, dayIndex) => {
                  const events = getEventsForDay(dayIndex);
                  return (
                    <div key={dayIndex} className="relative">
                      {events.map(event => {
                        const { top, height } = getEventPosition(event);
                        const isCompact = height < 48;
                        return (
                          <div
                            key={event.id}
                            className="absolute left-1 right-1 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-default group"
                            style={{
                              top: `${top}px`,
                              height: `${height - 2}px`,
                              backgroundColor: event.color,
                              zIndex: 15
                            }}
                          >
                            <div className={`h-full p-2 flex ${isCompact ? 'items-center gap-2' : 'flex-col justify-between'}`}>
                              <div className={`flex items-center gap-1.5 ${isCompact ? '' : 'mb-auto'}`}>
                                <span className="text-white/80 flex-shrink-0">
                                  {getCategoryIcon(event.categoryType || 'otro', isCompact ? 10 : 12)}
                                </span>
                                <span className="text-white font-bold text-[11px] truncate leading-tight">
                                  {event.name}
                                </span>
                              </div>
                              {!isCompact && (
                                <div className="text-white/80 text-[10px] font-medium">
                                  {event.startTime.slice(0, 5)} - {event.endTime.slice(0, 5)}
                                </div>
                              )}
                            </div>
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current time indicator */}
            {showCurrentTime && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${currentTimeTop}px` }}
              >
                <div className="flex items-center" style={{ marginLeft: '48px' }}>
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 time-indicator-dot" />
                  <div className="flex-1 h-[2px] bg-red-500/60" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {[
          { color: 'bg-indigo-500', label: 'Materias' },
          { color: 'bg-emerald-500', label: 'Trabajo' },
          { color: 'bg-orange-500', label: 'Gym' },
          { color: 'bg-cyan-500', label: 'Proyectos' },
          { color: 'bg-purple-500', label: 'Idiomas' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
