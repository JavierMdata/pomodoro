
import React, { useState } from 'react';
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
    name: '', code: '', professor_name: '', classroom: '', color: '#3B82F6' 
  });
  const [scheduleForm, setScheduleForm] = useState({ subject_id: '', day_of_week: 1, start_time: '08:00', end_time: '10:00' });

  const activePeriods = periods.filter(p => p.profile_id === activeProfileId);
  const currentPeriod = activePeriods.find(p => p.id === selectedPeriodId) || activePeriods[0];
  const periodSubjects = subjects.filter(s => s.school_period_id === currentPeriod?.id);

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

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Plan de Estudios</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Organiza tus semestres, materias y horarios.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView('add-period')}
            className={`px-4 py-2 border rounded-xl font-bold text-sm transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Nuevo Periodo
          </button>
          <button 
            onClick={() => setActiveView('add-subject')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"
          >
            Agregar Materia
          </button>
        </div>
      </div>

      {(activeView === 'add-period' || activeView === 'add-subject' || activeView === 'schedule') && (
        <div className={`p-8 rounded-[2.5rem] border shadow-sm animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {activeView === 'add-period' && (
            <>
              <h3 className="text-xl font-bold mb-6">Crear Nuevo Periodo</h3>
              <form onSubmit={handleAddPeriod} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Nombre</label>
                  <input type="text" required value={periodForm.name} onChange={e => setPeriodForm({...periodForm, name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Semestre 2024-I" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Inicio</label>
                  <input type="date" required value={periodForm.start_date} onChange={e => setPeriodForm({...periodForm, start_date: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Fin</label>
                  <input type="date" required value={periodForm.end_date} onChange={e => setPeriodForm({...periodForm, end_date: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setActiveView('list')} className="px-6 py-3 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Crear Periodo</button>
                </div>
              </form>
            </>
          )}

          {activeView === 'add-subject' && (
            <>
              <h3 className="text-xl font-bold mb-6">Nueva Materia para {currentPeriod?.name}</h3>
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Nombre de Materia</label>
                  <input type="text" required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Algoritmos" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Profesor</label>
                  <input type="text" value={subjectForm.professor_name} onChange={e => setSubjectForm({...subjectForm, professor_name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Dr. House" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Aula</label>
                  <input type="text" value={subjectForm.classroom} onChange={e => setSubjectForm({...subjectForm, classroom: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Laboratorio 102" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setActiveView('list')} className="px-6 py-3 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Guardar Materia</button>
                </div>
              </form>
            </>
          )}

          {activeView === 'schedule' && (
            <>
              <h3 className="text-xl font-bold mb-6">Bloque de Clase</h3>
              <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Día</label>
                  <select 
                    value={scheduleForm.day_of_week} 
                    onChange={e => setScheduleForm({...scheduleForm, day_of_week: parseInt(e.target.value)})}
                    className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                  >
                    {days.map((day, i) => <option key={day} value={i}>{day}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Inicio</label>
                    <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Fin</label>
                    <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} className={`w-full p-4 rounded-2xl outline-none ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setActiveView('list')} className="px-6 py-3 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Agregar Bloque</button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {activeView === 'list' && (
        <div className="space-y-6">
          <div className={`flex items-center gap-4 p-4 rounded-3xl border overflow-x-auto ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {activePeriods.map(p => (
              <button 
                key={p.id} 
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${selectedPeriodId === p.id || (!selectedPeriodId && activePeriods[0]?.id === p.id) ? 'bg-indigo-600 text-white shadow-md' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {p.name}
              </button>
            ))}
            {activePeriods.length === 0 && <p className="text-slate-400 text-xs px-4">Aún no has creado periodos escolares.</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Book className="text-indigo-500" size={20} />
                Materias Inscritas
              </h3>
              {periodSubjects.length === 0 ? (
                <div className={`p-12 rounded-[2.5rem] border border-dashed text-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <p className="text-slate-400 font-medium italic">Empieza agregando tu primera materia.</p>
                </div>
              ) : (
                periodSubjects.map(subject => (
                  <div key={subject.id} className={`p-6 rounded-3xl border shadow-sm transition-all group ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: subject.color }}>
                          {subject.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold">{subject.name}</h4>
                          <p className="text-xs text-slate-500">{subject.professor_name || 'Profesor TBD'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setScheduleForm({ ...scheduleForm, subject_id: subject.id });
                          setActiveView('schedule');
                        }}
                        className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-400 hover:text-indigo-400' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                      >
                        <Clock size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-indigo-500" size={20} />
                Horario Semanal
              </h3>
              <div className={`p-6 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="space-y-6">
                  {days.slice(1, 6).map((day, index) => {
                    const dayNum = index + 1;
                    const dayClasses = schedules.filter(s => {
                      const subj = subjects.find(sub => sub.id === s.subject_id);
                      return subj?.school_period_id === currentPeriod?.id && s.day_of_week === dayNum;
                    }).sort((a, b) => a.start_time.localeCompare(b.start_time));

                    return (
                      <div key={day} className="flex gap-4">
                        <div className="w-20 pt-1">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{day}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {dayClasses.length === 0 ? (
                            <p className="text-xs text-slate-300 italic opacity-40">--</p>
                          ) : (
                            dayClasses.map(cls => {
                              const subj = subjects.find(s => s.id === cls.subject_id);
                              return (
                                <div key={cls.id} className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`} style={{ borderLeftColor: subj?.color }}>
                                  <div>
                                    <p className="text-xs font-bold">{subj?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{cls.start_time} - {cls.end_time}</p>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
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
