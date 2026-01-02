
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  Plus, Book, Users, MapPin, Calendar, 
  Trash2, ChevronRight, Clock, PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';

const SubjectManager: React.FC = () => {
  const { 
    theme, activeProfileId, periods, subjects, schedules, 
    addPeriod, addSubject, addSchedule 
  } = useAppStore();

  const [activeView, setActiveView] = useState<'list' | 'add-period' | 'add-subject' | 'schedule'>('list');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const [periodForm, setPeriodForm] = useState({ name: '', start_date: '', end_date: '' });
  const [subjectForm, setSubjectForm] = useState({ 
    name: '', code: '', professor_name: '', classroom: '', color: '#6366f1' 
  });
  const [scheduleForm, setScheduleForm] = useState({ subject_id: '', day_of_week: 1, start_time: '08:00', end_time: '10:00' });

  const activePeriods = periods.filter(p => p.profile_id === activeProfileId);
  const currentPeriod = activePeriods.find(p => p.id === selectedPeriodId) || activePeriods[0];
  const periodSubjects = subjects.filter(s => s.school_period_id === currentPeriod?.id);

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const workingDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 a 20:00

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;
    addPeriod({ ...periodForm, profile_id: activeProfileId, is_active: true });
    setActiveView('list');
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !activeProfileId) return;
    addSubject({ 
      ...subjectForm, 
      profile_id: activeProfileId, 
      school_period_id: currentPeriod.id,
      start_date: currentPeriod.start_date,
      end_date: currentPeriod.end_date,
      icon: 'book'
    });
    setActiveView('list');
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    addSchedule(scheduleForm);
    setActiveView('list');
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-12 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Gestión Académica</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-bold mt-2`}>Planifica tu éxito con una agenda milimétrica.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveView('add-period')}
            className={`px-6 py-4 border-2 rounded-2xl font-black text-sm transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Nuevo Periodo
          </button>
          <button 
            onClick={() => setActiveView('add-subject')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            Agregar Materia
          </button>
        </div>
      </div>

      {(activeView === 'add-period' || activeView === 'add-subject' || activeView === 'schedule') && (
        <div className={`p-10 rounded-[3rem] border-2 shadow-2xl animate-in zoom-in duration-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          {activeView === 'add-period' && (
            <>
              <h3 className="text-2xl font-black mb-8">Definir Nuevo Ciclo Académico</h3>
              <form onSubmit={handleAddPeriod} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-3">
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Nombre del Periodo</label>
                  <input type="text" required value={periodForm.name} onChange={e => setPeriodForm({...periodForm, name: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold text-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} placeholder="Ej: Semestre Otoño 2025" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Fecha de Inicio</label>
                  <input type="date" required value={periodForm.start_date} onChange={e => setPeriodForm({...periodForm, start_date: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Fecha de Fin</label>
                  <input type="date" required value={periodForm.end_date} onChange={e => setPeriodForm({...periodForm, end_date: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} />
                </div>
                <div className="md:col-span-3 flex justify-end gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400">Cancelar</button>
                  <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20">Crear Ciclo</button>
                </div>
              </form>
            </>
          )}

          {activeView === 'add-subject' && (
            <>
              <h3 className="text-2xl font-black mb-8">Nueva Materia para {currentPeriod?.name}</h3>
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Nombre de la Materia</label>
                  <input type="text" required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-black text-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} placeholder="Ej: Cálculo Vectorial" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Profesor a Cargo</label>
                  <input type="text" value={subjectForm.professor_name} onChange={e => setSubjectForm({...subjectForm, professor_name: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} placeholder="Ej: Dr. García" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Ubicación / Aula</label>
                  <input type="text" value={subjectForm.classroom} onChange={e => setSubjectForm({...subjectForm, classroom: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} placeholder="Ej: Salón B-204" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400">Cancelar</button>
                  <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20">Guardar Materia</button>
                </div>
              </form>
            </>
          )}

          {activeView === 'schedule' && (
            <>
              <h3 className="text-2xl font-black mb-8">Definir Bloque Horario</h3>
              <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Día de la Semana</label>
                  <select 
                    value={scheduleForm.day_of_week} 
                    onChange={e => setScheduleForm({...scheduleForm, day_of_week: parseInt(e.target.value)})}
                    className={`w-full p-5 rounded-2xl outline-none font-black text-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}
                  >
                    {days.map((day, i) => <option key={day} value={i}>{day}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Entrada</label>
                    <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Salida</label>
                    <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} className={`w-full p-5 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400">Cancelar</button>
                  <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20">Añadir Bloque</button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {activeView === 'list' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className={`flex items-center gap-4 p-4 rounded-3xl border-2 overflow-x-auto scrollbar-hide ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            {activePeriods.map(p => (
              <button 
                key={p.id} 
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-8 py-3 rounded-2xl whitespace-nowrap font-black text-sm transition-all ${selectedPeriodId === p.id || (!selectedPeriodId && activePeriods[0]?.id === p.id) ? 'bg-indigo-600 text-white shadow-xl scale-105' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
            {/* Listado de Materias Lateral */}
            <div className="xl:col-span-1 space-y-6">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                Materias
              </h3>
              {periodSubjects.length === 0 ? (
                <div className={`p-10 rounded-[3rem] border-4 border-dashed text-center ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                   <p className="font-bold italic">No hay materias aún.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {periodSubjects.map(subject => (
                    <div key={subject.id} className={`p-6 rounded-3xl border-2 shadow-sm transition-all group hover:-translate-x-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-50 hover:border-indigo-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: subject.color }} />
                        <button 
                          onClick={() => {
                            setScheduleForm({ ...scheduleForm, subject_id: subject.id });
                            setActiveView('schedule');
                          }}
                          className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-700 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                      <h4 className="font-black text-lg leading-tight group-hover:text-indigo-500 transition-colors">{subject.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{subject.professor_name || 'Prof. Pendiente'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Horario Profesional en Rejilla */}
            <div className="xl:col-span-3 space-y-6">
               <h3 className="text-2xl font-black flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                Agenda Semanal
              </h3>
              
              <div className={`rounded-[3.5rem] border-2 shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr>
                        <th className={`p-6 border-b-2 text-xs font-black uppercase tracking-widest text-slate-400 text-right w-24 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>Hora</th>
                        {workingDays.map(day => (
                          <th key={day} className={`p-6 border-b-2 text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'border-slate-800 text-slate-200' : 'border-slate-50 text-slate-950'}`}>
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(hour => {
                        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <tr key={hour} className="group">
                            <td className={`p-4 text-xs font-bold text-slate-400 text-right border-r-2 align-top ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50 group-hover:bg-slate-50'}`}>
                              {timeStr}
                            </td>
                            {workingDays.map((day, idx) => {
                              const dayNum = idx + 1;
                              const slotClasses = schedules.filter(s => {
                                const subj = subjects.find(sub => sub.id === s.subject_id);
                                return subj?.school_period_id === currentPeriod?.id && 
                                       s.day_of_week === dayNum &&
                                       parseInt(s.start_time.split(':')[0]) === hour;
                              });

                              return (
                                <td key={`${day}-${hour}`} className={`p-2 border-b-2 border-r-2 h-24 relative transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-white/5' : 'border-slate-50 hover:bg-indigo-50/30'}`}>
                                  {slotClasses.map(cls => {
                                    const subj = subjects.find(s => s.id === cls.subject_id);
                                    return (
                                      <div 
                                        key={cls.id} 
                                        className="absolute inset-2 p-3 rounded-2xl text-white shadow-xl transition-transform hover:scale-105 z-10 flex flex-col justify-between overflow-hidden"
                                        style={{ backgroundColor: subj?.color || '#6366f1' }}
                                      >
                                        <div className="absolute top-0 right-0 p-1 opacity-20"><Clock size={24} /></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">{cls.start_time}</p>
                                        <p className="text-xs font-black leading-tight line-clamp-2">{subj?.name}</p>
                                        <p className="text-[9px] font-bold opacity-70 truncate">{subj?.classroom}</p>
                                      </div>
                                    )
                                  })}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
