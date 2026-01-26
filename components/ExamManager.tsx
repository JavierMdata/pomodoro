
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  Plus, ClipboardList, BookOpen, AlertCircle,
  ChevronRight, Calendar, Trash2, CheckCircle2, Clock, Edit2, Check,
  GraduationCap, Target, BookMarked, ChevronDown, ChevronUp, Flame
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

const ExamManager: React.FC = () => {
  const {
    theme, activeProfileId, subjects, exams, examTopics,
    addExam, updateExam, deleteExam, addExamTopic, updateExamTopic, deleteExamTopic
  } = useAppStore();

  const [activeView, setActiveView] = useState<'list' | 'add-exam' | 'add-topic' | 'edit-exam' | 'edit-topic'>('list');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [editingExamId, setEditingExamId] = useState<string>('');
  const [editingTopicId, setEditingTopicId] = useState<string>('');
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());

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

  const toggleExamExpanded = (examId: string) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examId)) {
      newExpanded.delete(examId);
    } else {
      newExpanded.add(examId);
    }
    setExpandedExams(newExpanded);
  };

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

  // Calcular días restantes y estado de urgencia
  const getExamUrgency = (examDate: string) => {
    const days = differenceInDays(new Date(examDate), new Date());
    if (days < 0) return { label: 'Pasado', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
    if (days === 0) return { label: '¡Hoy!', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' };
    if (days === 1) return { label: 'Mañana', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' };
    if (days <= 3) return { label: `${days} días`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' };
    if (days <= 7) return { label: `${days} días`, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' };
    return { label: `${days} días`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
  };

  // Calcular progreso de temas
  const getExamProgress = (examId: string) => {
    const topics = examTopics.filter(et => et.exam_id === examId);
    if (topics.length === 0) return { total: 0, completed: 0, percentage: 0, totalPomos: 0, completedPomos: 0 };

    const completed = topics.filter(t => t.status === 'completed').length;
    const totalPomos = topics.reduce((acc, t) => acc + t.estimated_pomodoros, 0);
    const completedPomos = topics.reduce((acc, t) => acc + t.completed_pomodoros, 0);

    return {
      total: topics.length,
      completed,
      percentage: Math.round((completed / topics.length) * 100),
      totalPomos,
      completedPomos
    };
  };

  const cardBg = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white';
  const cardBorder = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200';
  const inputBg = theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
            <GraduationCap size={32} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Mis Exámenes</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {profileExams.length} {profileExams.length === 1 ? 'evaluación' : 'evaluaciones'} programadas
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('add-exam')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Examen
        </button>
      </div>

      {/* Formularios */}
      {(activeView === 'add-exam' || activeView === 'edit-exam') && (
        <div className={`${cardBg} border ${cardBorder} p-6 sm:p-8 rounded-2xl shadow-xl mb-8 animate-in slide-in-from-top duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <BookMarked size={24} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-black">
              {activeView === 'add-exam' ? 'Programar Nuevo Examen' : 'Editar Examen'}
            </h3>
          </div>

          <form onSubmit={activeView === 'add-exam' ? handleAddExam : handleSaveEditExam} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Materia</label>
                <select
                  required
                  value={examForm.subject_id}
                  onChange={e => setExamForm({ ...examForm, subject_id: e.target.value })}
                  className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-indigo-500 transition-colors ${inputBg}`}
                >
                  <option value="">Selecciona una materia...</option>
                  {profileSubjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Nombre del Examen</label>
                <input
                  type="text"
                  required
                  value={examForm.name}
                  onChange={e => setExamForm({ ...examForm, name: e.target.value })}
                  className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-indigo-500 transition-colors ${inputBg}`}
                  placeholder="Ej: Parcial 1, Final, Quiz..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={examForm.exam_date}
                  onChange={e => setExamForm({ ...examForm, exam_date: e.target.value })}
                  className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-indigo-500 transition-colors ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Duración (minutos)</label>
                <input
                  type="number"
                  value={examForm.duration_minutes}
                  onChange={e => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) || 60 })}
                  className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-indigo-500 transition-colors ${inputBg}`}
                  min="15"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Peso en la nota (%)</label>
                <input
                  type="number"
                  value={examForm.weight_percentage}
                  onChange={e => setExamForm({ ...examForm, weight_percentage: parseInt(e.target.value) || 0 })}
                  className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-indigo-500 transition-colors ${inputBg}`}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {activeView === 'add-exam' ? 'Crear Examen' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(activeView === 'add-topic' || activeView === 'edit-topic') && (
        <div className={`${cardBg} border ${cardBorder} p-6 sm:p-8 rounded-2xl shadow-xl mb-8 animate-in slide-in-from-top duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Target size={24} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-black">
              {activeView === 'add-topic' ? 'Agregar Tema de Estudio' : 'Editar Tema'}
            </h3>
          </div>

          <form onSubmit={activeView === 'add-topic' ? handleAddTopic : handleSaveEditTopic} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Nombre del Tema</label>
              <input
                type="text"
                required
                value={topicForm.title}
                onChange={e => setTopicForm({ ...topicForm, title: e.target.value })}
                className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-purple-500 transition-colors ${inputBg}`}
                placeholder="Ej: Leyes de Newton, Derivadas, etc."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Pomodoros Estimados
                <span className="text-slate-500 font-normal ml-2">(~{topicForm.estimated_pomodoros * 25} min)</span>
              </label>
              <input
                type="number"
                required
                value={topicForm.estimated_pomodoros}
                onChange={e => setTopicForm({ ...topicForm, estimated_pomodoros: parseInt(e.target.value) || 1 })}
                className={`w-full p-4 rounded-xl outline-none font-semibold border-2 border-transparent focus:border-purple-500 transition-colors ${inputBg}`}
                min="1"
                max="20"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {activeView === 'add-topic' ? 'Agregar Tema' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Exámenes */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {profileExams.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <ClipboardList size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black mb-2">Sin exámenes programados</h3>
              <p className={`max-w-sm mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Agrega tus próximas evaluaciones para organizar tu estudio de forma efectiva.
              </p>
              <button
                onClick={() => setActiveView('add-exam')}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Agregar primer examen
              </button>
            </div>
          ) : (
            profileExams.map((exam, index) => {
              const subject = subjects.find(s => s.id === exam.subject_id);
              const topics = examTopics.filter(et => et.exam_id === exam.id);
              const urgency = getExamUrgency(exam.exam_date);
              const progress = getExamProgress(exam.id);
              const isExpanded = expandedExams.has(exam.id);
              const daysUntil = differenceInDays(new Date(exam.exam_date), new Date());

              return (
                <div
                  key={exam.id}
                  className={`${cardBg} border-2 ${cardBorder} rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: subject?.color || '#6366f1' }}
                >
                  {/* Header del Examen - Siempre visible */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExamExpanded(exam.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Indicador de urgencia */}
                      <div className={`px-3 py-2 rounded-xl text-center min-w-[80px] ${urgency.bg}`}>
                        {daysUntil <= 3 && daysUntil >= 0 && (
                          <Flame size={16} className={`mx-auto mb-1 ${urgency.color}`} />
                        )}
                        <p className={`text-xs font-black ${urgency.color}`}>
                          {urgency.label}
                        </p>
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subject?.color || '#6366f1' }}
                          />
                          <span className={`text-xs font-bold uppercase tracking-wider truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {subject?.name || 'Sin materia'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black truncate mb-2">{exam.name}</h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Calendar size={14} />
                            <span className="font-semibold">
                              {format(new Date(exam.exam_date), "EEE d MMM", { locale: es })}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Clock size={14} />
                            <span className="font-semibold">
                              {format(new Date(exam.exam_date), "HH:mm")}
                            </span>
                          </div>
                          {exam.duration_minutes > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                              {exam.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones y toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditExam(exam); }}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id, exam.name); }}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${theme === 'dark' ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso compacta */}
                    {topics.length > 0 && (
                      <div className="mt-4 flex items-center gap-3">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold min-w-[60px] text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {progress.completed}/{progress.total} temas
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido expandible - Temas */}
                  {isExpanded && (
                    <div className={`border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'} p-5`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Temario de Estudio
                        </h4>
                        <button
                          onClick={() => { setSelectedExamId(exam.id); setActiveView('add-topic'); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                          Agregar tema
                        </button>
                      </div>

                      {topics.length === 0 ? (
                        <p className={`text-sm italic py-4 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                          No hay temas definidos. Agrega los temas que necesitas estudiar.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {topics.map((topic) => {
                            const topicProgress = topic.estimated_pomodoros > 0
                              ? Math.min((topic.completed_pomodoros / topic.estimated_pomodoros) * 100, 100)
                              : 0;

                            return (
                              <div
                                key={topic.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                  theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'
                                } ${topic.status === 'completed' ? 'opacity-60' : ''}`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleToggleTopicComplete(topic)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                    topic.status === 'completed'
                                      ? 'bg-emerald-500 text-white'
                                      : theme === 'dark'
                                        ? 'bg-slate-700 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400'
                                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500'
                                  }`}
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>

                                {/* Info del tema */}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold truncate ${topic.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                    {topic.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-16 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                      <div
                                        className={`h-full transition-all duration-500 ${
                                          topicProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                        }`}
                                        style={{ width: `${topicProgress}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {topic.completed_pomodoros}/{topic.estimated_pomodoros}
                                    </span>
                                  </div>
                                </div>

                                {/* Acciones del tema */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEditTopic(topic)}
                                    className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTopic(topic.id, topic.title)}
                                    className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Resumen de pomodoros */}
                      {topics.length > 0 && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
                          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Total de estudio:
                          </span>
                          <span className="text-sm font-bold text-indigo-500">
                            {progress.completedPomos} / {progress.totalPomos} Pomodoros
                            <span className={`ml-2 text-xs font-normal ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                              (~{progress.totalPomos * 25} min)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManager;
