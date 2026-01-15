import React, { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Clock, MapPin, User, ChevronRight, Plus } from 'lucide-react';

const WeeklySchedule: React.FC = () => {
  const { theme, activeProfileId, subjects, schedules } = useAppStore();

  const daysOfWeek = [
    { id: 1, name: 'Lunes', short: 'LUN' },
    { id: 2, name: 'Martes', short: 'MAR' },
    { id: 3, name: 'Miércoles', short: 'MIÉ' },
    { id: 4, name: 'Jueves', short: 'JUE' },
    { id: 5, name: 'Viernes', short: 'VIE' },
    { id: 6, name: 'Sábado', short: 'SÁB' },
    { id: 0, name: 'Domingo', short: 'DOM' },
  ];

  const hours = Array.from({ length: 14 }, (_, i) => 7 + i); // 7 AM - 8 PM

  // Filtrar horarios del perfil activo
  const activeSchedules = useMemo(() => {
    if (!activeProfileId) return [];
    return schedules.filter(s => {
      const subj = subjects.find(sub => sub.id === s.subject_id);
      return subj?.profile_id === activeProfileId;
    });
  }, [schedules, subjects, activeProfileId]);

  // Organizar clases por día y hora
  const scheduleGrid = useMemo(() => {
    const grid: Record<number, Record<number, any[]>> = {};

    daysOfWeek.forEach(day => {
      grid[day.id] = {};
      hours.forEach(hour => {
        grid[day.id][hour] = [];
      });
    });

    activeSchedules.forEach(schedule => {
      const subject = subjects.find(s => s.id === schedule.subject_id);
      if (!subject) return;

      const [startHour] = schedule.start_time.split(':').map(Number);
      const [endHour] = schedule.end_time.split(':').map(Number);

      const classData = {
        ...schedule,
        subject,
        startHour,
        endHour,
        duration: endHour - startHour
      };

      if (grid[schedule.day_of_week] && grid[schedule.day_of_week][startHour]) {
        grid[schedule.day_of_week][startHour].push(classData);
      }
    });

    return grid;
  }, [activeSchedules, subjects, daysOfWeek, hours]);

  const today = new Date().getDay();
  const currentHour = new Date().getHours();

  if (!activeProfileId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Selecciona un perfil para ver tu horario</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[4rem]">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className={`p-12 rounded-[3.5rem] backdrop-blur-xl border-2 shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/60 border-white/10'
            : 'bg-white/60 border-slate-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Mi Horario
              </h1>
              <p className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Vista semanal completa de tus clases
              </p>
            </div>

            <button className="group relative px-8 py-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[2rem] shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <Plus size={24} />
                <span className="font-black text-lg">Nueva Clase</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className={`rounded-[3.5rem] backdrop-blur-xl border-2 shadow-2xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-white/10'
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 sticky top-0 z-10">
              {/* Empty corner */}
              <div className={`p-6 border-b-2 border-r-2 ${
                theme === 'dark'
                  ? 'bg-slate-800/95 border-slate-700'
                  : 'bg-slate-50/95 border-slate-200'
              }`}>
                <Clock size={24} className="text-slate-400 mx-auto" />
              </div>

              {/* Day columns */}
              {daysOfWeek.map((day) => {
                const isToday = day.id === today;
                return (
                  <div
                    key={day.id}
                    className={`p-6 border-b-2 border-r-2 text-center transition-all ${
                      isToday
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-700'
                          : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300'
                        : theme === 'dark'
                        ? 'bg-slate-800/95 border-slate-700'
                        : 'bg-slate-50/95 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                      {day.short}
                    </div>
                    <div className={`text-sm font-black ${
                      isToday
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : theme === 'dark'
                        ? 'text-slate-300'
                        : 'text-slate-700'
                    }`}>
                      {day.name}
                    </div>
                    {isToday && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-2 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time slots */}
            {hours.map((hour) => {
              const isCurrentHour = hour === currentHour;

              return (
                <div key={hour} className="grid grid-cols-8">
                  {/* Hour label */}
                  <div className={`p-4 border-b border-r-2 text-center font-mono transition-all ${
                    isCurrentHour
                      ? theme === 'dark'
                        ? 'bg-indigo-900/30 border-slate-700 text-indigo-400'
                        : 'bg-indigo-50 border-slate-200 text-indigo-600'
                      : theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                      : 'bg-slate-50/50 border-slate-200 text-slate-500'
                  }`}>
                    <div className="text-lg font-black">{hour.toString().padStart(2, '0')}:00</div>
                    <div className="text-[9px] uppercase tracking-wider opacity-60">
                      {hour < 12 ? 'AM' : 'PM'}
                    </div>
                  </div>

                  {/* Day cells */}
                  {daysOfWeek.map((day) => {
                    const classes = scheduleGrid[day.id]?.[hour] || [];
                    const isToday = day.id === today;
                    const isNow = isToday && isCurrentHour;

                    return (
                      <div
                        key={`${day.id}-${hour}`}
                        className={`p-2 border-b border-r relative min-h-[80px] transition-all ${
                          isNow
                            ? 'bg-indigo-500/10 ring-2 ring-inset ring-indigo-500/30'
                            : isToday
                            ? theme === 'dark'
                              ? 'bg-slate-800/30 border-slate-700/50'
                              : 'bg-indigo-50/20 border-indigo-100'
                            : theme === 'dark'
                            ? 'bg-slate-800/20 border-slate-700/30'
                            : 'bg-white/50 border-slate-200/50'
                        } hover:bg-slate-700/20 dark:hover:bg-slate-700/40`}
                      >
                        {classes.map((classItem, idx) => (
                          <div
                            key={`${classItem.id}-${idx}`}
                            className={`group relative rounded-2xl p-3 mb-2 shadow-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl animate-in fade-in slide-in-from-bottom duration-300`}
                            style={{
                              backgroundColor: classItem.subject.color + 'E6',
                              minHeight: `${classItem.duration * 60}px`
                            }}
                          >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Content */}
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-black text-white text-sm leading-tight pr-2">
                                  {classItem.subject.name}
                                </h4>
                                <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                              </div>

                              <div className="space-y-1.5 text-white/90 text-xs font-medium">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className="flex-shrink-0" />
                                  <span className="font-mono">{classItem.start_time} - {classItem.end_time}</span>
                                </div>

                                {classItem.subject.classroom && (
                                  <div className="flex items-center gap-2">
                                    <MapPin size={12} className="flex-shrink-0" />
                                    <span className="truncate">{classItem.subject.classroom}</span>
                                  </div>
                                )}

                                {classItem.subject.professor_name && (
                                  <div className="flex items-center gap-2">
                                    <User size={12} className="flex-shrink-0" />
                                    <span className="truncate">{classItem.subject.professor_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 shimmer opacity-20" />
                          </div>
                        ))}

                        {/* Empty state indicator */}
                        {classes.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus size={16} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`p-8 rounded-[3rem] border backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-slate-900/60 border-white/10'
          : 'bg-white/60 border-slate-200/50'
      }`}>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-indigo-500/30 ring-2 ring-indigo-500/50 rounded" />
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Hora actual
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-indigo-900/40' : 'bg-indigo-50'}`} />
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Día de hoy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-indigo-500 rounded" />
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Clase programada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
