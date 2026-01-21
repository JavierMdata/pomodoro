
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Plus, ClipboardList, BookOpen, AlertCircle,
  ChevronRight, Calendar, Trash2, CheckCircle2, Clock, Edit2, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MiniPomodoro from './MiniPomodoro';

const ExamManager: React.FC = () => {
  const {
    theme, activeProfileId, subjects, exams, examTopics,
    addExam, updateExam, deleteExam, addExamTopic, updateExamTopic, deleteExamTopic
  } = useAppStore();

  const [activeView, setActiveView] = useState<'list' | 'add-exam' | 'add-topic' | 'edit-exam' | 'edit-topic'>('list');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [editingExamId, setEditingExamId] = useState<string>('');
  const [editingTopicId, setEditingTopicId] = useState<string>('');

  const [examForm, setExamForm] = useState({
    subject_id: '',
    name: '',
    exam_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: 120,
    weight_percentage: 20,
    alert_days_before: 3
  });

  const [topicForm, setTopicForm] = useState({
    title: '',
    estimated_pomodoros: 4
  });

  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const profileExams = exams.filter(e => {
    const subj = subjects.find(s => s.id === e.subject_id);
    return subj?.profile_id === activeProfileId;
  }).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({ ...examForm, status: 'upcoming' });
    setExamForm({
      subject_id: '',
      name: '',
      exam_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: 120,
      weight_percentage: 20,
      alert_days_before: 3
    });
    setActiveView('list');
  };

  const handleEditExam = (exam: any) => {
    setEditingExamId(exam.id);
    setExamForm({
      subject_id: exam.subject_id,
      name: exam.name,
      exam_date: format(new Date(exam.exam_date), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: exam.duration_minutes,
      weight_percentage: exam.weight_percentage,
      alert_days_before: exam.alert_days_before
    });
    setActiveView('edit-exam');
  };

  const handleSaveEditExam = (e: React.FormEvent) => {
    e.preventDefault();
    updateExam(editingExamId, examForm);
    setExamForm({
      subject_id: '',
      name: '',
      exam_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: 120,
      weight_percentage: 20,
      alert_days_before: 3
    });
    setEditingExamId('');
    setActiveView('list');
  };

  const handleDeleteExam = (examId: string, examName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${examName}"? Se eliminarán todos sus temas de estudio.`)) {
      deleteExam(examId);
    }
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    addExamTopic({ ...topicForm, exam_id: selectedExamId, status: 'not_started' });
    setTopicForm({ title: '', estimated_pomodoros: 4 });
    setActiveView('list');
  };

  const handleEditTopic = (topic: any) => {
    setEditingTopicId(topic.id);
    setSelectedExamId(topic.exam_id);
    setTopicForm({
      title: topic.title,
      estimated_pomodoros: topic.estimated_pomodoros
    });
    setActiveView('edit-topic');
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    updateExamTopic(editingTopicId, topicForm);
    setTopicForm({ title: '', estimated_pomodoros: 4 });
    setEditingTopicId('');
    setActiveView('list');
  };

  const handleDeleteTopic = (topicId: string, topicTitle: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el tema "${topicTitle}"?`)) {
      deleteExamTopic(topicId);
    }
  };

  const handleToggleTopicComplete = (topic: any) => {
    const newStatus = topic.status === 'completed' ? 'not_started' : 'completed';
    updateExamTopic(topic.id, { status: newStatus });
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-8 relative ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Evaluaciones</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Mantén bajo control tus exámenes y temas de estudio.</p>
        </div>
        <button 
          onClick={() => setActiveView('add-exam')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Examen
        </button>
      </div>

      {activeView === 'add-exam' && (
        <div className={`p-10 rounded-[2.5rem] shadow-2xl border animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className="text-2xl font-black mb-8">Programar Evaluación</h3>
          <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Materia</label>
              <select 
                required value={examForm.subject_id}
                onChange={e => setExamForm({...examForm, subject_id: e.target.value})}
                className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
              >
                <option value="">Selecciona materia...</option>
                {profileSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Título</label>
              <input type="text" required value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Parcial 1" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Fecha y Hora</label>
              <input type="datetime-local" required value={examForm.exam_date} onChange={e => setExamForm({...examForm, exam_date: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Crear Examen</button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'edit-exam' && (
        <div className={`p-10 rounded-[2.5rem] shadow-2xl border animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className="text-2xl font-black mb-8">Editar Evaluación</h3>
          <form onSubmit={handleSaveEditExam} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Materia</label>
              <select
                required value={examForm.subject_id}
                onChange={e => setExamForm({...examForm, subject_id: e.target.value})}
                className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
              >
                <option value="">Selecciona materia...</option>
                {profileSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Título</label>
              <input type="text" required value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Parcial 1" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Fecha y Hora</label>
              <input type="datetime-local" required value={examForm.exam_date} onChange={e => setExamForm({...examForm, exam_date: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'add-topic' && (
        <div className={`p-10 rounded-[2.5rem] shadow-2xl border animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className="text-2xl font-black mb-8">Nuevo Tema de Estudio</h3>
          <form onSubmit={handleAddTopic} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Tema</label>
              <input type="text" required value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Leyes de Newton" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Pomodoros Sugeridos</label>
              <input type="number" required value={topicForm.estimated_pomodoros} onChange={e => setTopicForm({...topicForm, estimated_pomodoros: parseInt(e.target.value)})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Agregar Tema</button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'edit-topic' && (
        <div className={`p-10 rounded-[2.5rem] shadow-2xl border animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className="text-2xl font-black mb-8">Editar Tema de Estudio</h3>
          <form onSubmit={handleSaveEditTopic} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Tema</label>
              <input type="text" required value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} placeholder="Ej: Leyes de Newton" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Pomodoros Sugeridos</label>
              <input type="number" required value={topicForm.estimated_pomodoros} onChange={e => setTopicForm({...topicForm, estimated_pomodoros: parseInt(e.target.value)})} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`} />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setActiveView('list')} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'list' && (
        <div className="space-y-8">
          {profileExams.length === 0 ? (
            <div className={`text-center py-24 rounded-[3rem] border-4 border-dashed ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-600' : 'bg-white border-slate-200 text-slate-300'}`}>
              <ClipboardList size={64} className="mx-auto mb-6 opacity-20" />
              <h3 className="text-2xl font-black">Sin exámenes próximos</h3>
              <p className="font-medium max-w-xs mx-auto mt-2">Agrega tus evaluaciones para planificar tus temas de estudio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {profileExams.map(exam => {
                const subject = subjects.find(s => s.id === exam.subject_id);
                const topics = examTopics.filter(et => et.exam_id === exam.id);
                return (
                  <div key={exam.id} className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="p-8 flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-3 h-10 rounded-full" style={{ backgroundColor: subject?.color || '#3B82F6' }} />
                           <div className="flex-1">
                             <h4 className="text-xl font-black">{exam.name}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subject?.name}</p>
                           </div>
                           <div className="flex gap-2">
                             <button
                               onClick={() => handleEditExam(exam)}
                               className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                 theme === 'dark'
                                   ? 'bg-slate-700 text-slate-400 hover:text-indigo-400'
                                   : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
                               }`}
                               title="Editar examen"
                             >
                               <Edit2 size={16} />
                             </button>
                             <button
                               onClick={() => handleDeleteExam(exam.id, exam.name)}
                               className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                 theme === 'dark'
                                   ? 'bg-slate-700 text-slate-400 hover:text-red-400'
                                   : 'bg-slate-100 text-slate-600 hover:text-red-600'
                               }`}
                               title="Eliminar examen"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <Calendar size={18} className="text-indigo-500" />
                            {format(new Date(exam.exam_date), "EEEE d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <Clock size={18} className="text-indigo-500" />
                            {format(new Date(exam.exam_date), "HH:mm")} • {exam.duration_minutes} min
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedExamId(exam.id); setActiveView('add-topic'); }}
                          className={`mt-8 w-full py-3 rounded-2xl font-bold text-sm transition-all ${theme === 'dark' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-black'}`}
                        >
                          + Agregar Tema
                        </button>
                      </div>

                      <div className={`flex-1 p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Temario de Estudio</h5>
                        {topics.length === 0 ? (
                          <p className="text-slate-400 text-sm italic">Define los temas que vendrán en este examen.</p>
                        ) : (
                          <div className="space-y-3">
                            {topics.map(topic => (
                              <div key={topic.id} className={`p-4 rounded-2xl flex items-center justify-between border group ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => handleToggleTopicComplete(topic)}
                                    className={`p-2 rounded-xl transition-all hover:scale-110 ${
                                      topic.status === 'completed'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-slate-400/10 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500'
                                    }`}
                                    title={topic.status === 'completed' ? 'Marcar como pendiente' : 'Marcar como completado'}
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <div className="flex-1">
                                    <p className={`text-sm font-bold ${topic.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                      {topic.title}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {topic.completed_pomodoros} / {topic.estimated_pomodoros} Pomos
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-24 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                    <div
                                      className="h-full bg-indigo-500 transition-all duration-700"
                                      style={{ width: `${Math.min((topic.completed_pomodoros / topic.estimated_pomodoros) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditTopic(topic)}
                                      className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                        theme === 'dark'
                                          ? 'bg-slate-700 text-slate-400 hover:text-indigo-400'
                                          : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
                                      }`}
                                      title="Editar tema"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTopic(topic.id, topic.title)}
                                      className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                        theme === 'dark'
                                          ? 'bg-slate-700 text-slate-400 hover:text-red-400'
                                          : 'bg-slate-100 text-slate-600 hover:text-red-600'
                                      }`}
                                      title="Eliminar tema"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManager;
