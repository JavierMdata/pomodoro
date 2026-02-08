import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import FullscreenPomodoro from './FullscreenPomodoro';
import MiniPomodoro from './MiniPomodoro';
import EditSubjectSchedules from './EditSubjectSchedules';
import {
  GraduationCap, Plus, BookOpen, FolderKanban, PlayCircle,
  ChevronDown, ChevronRight, Clock, Target, Sparkles, Flame,
  Edit2, Trash2, Calendar
} from 'lucide-react';

interface SubjectWithData {
  subject: any;
  exams: any[];
  topics: any[];
  tasks: any[];
  materials: any[];
}

interface PomodoroItem {
  id: string;
  title: string;
  color: string;
  subjectName: string;
  type: 'task' | 'topic' | 'material';
}

const SubjectsManager: React.FC = () => {
  const {
    theme, activeProfileId, subjects, exams, examTopics, tasks, materials,
    addSubject, updateSubject, deleteSubject, settings, addSession
  } = useAppStore();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editingSchedulesSubject, setEditingSchedulesSubject] = useState<any>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [pomodoroItem, setPomodoroItem] = useState<PomodoroItem | null>(null);

  const currentSettings = activeProfileId ? settings[activeProfileId] : null;

  const activeSubjects = useMemo(() => {
    if (!activeProfileId) return [];
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  const subjectsWithData: SubjectWithData[] = useMemo(() => {
    return activeSubjects.map(subject => {
      const subjectExams = exams.filter(e => e.subject_id === subject.id);
      const allTopics = examTopics.filter(et =>
        subjectExams.some(exam => exam.id === et.exam_id)
      );
      const subjectTasks = tasks.filter(t => t.subject_id === subject.id);
      const subjectMaterials = materials.filter(m => m.subject_id === subject.id);

      return {
        subject,
        exams: subjectExams,
        topics: allTopics,
        tasks: subjectTasks,
        materials: subjectMaterials
      };
    });
  }, [activeSubjects, exams, examTopics, tasks, materials]);

  const toggleSubject = (id: string) => {
    const newSet = new Set(expandedSubjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSubjects(newSet);
  };

  const toggleExam = (id: string) => {
    const newSet = new Set(expandedExams);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedExams(newSet);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim() || !activeProfileId) return;
    addSubject({
      profile_id: activeProfileId,
      school_period_id: null,
      name: newSubjectName.trim(),
      color: newSubjectColor
    });
    setNewSubjectName('');
    setNewSubjectColor('#6366f1');
    setShowAddSubject(false);
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setNewSubjectColor(subject.color);
    setShowEditSubject(true);
  };

  const handleSaveEditSubject = () => {
    if (!newSubjectName.trim() || !editingSubject) return;
    updateSubject(editingSubject.id, {
      name: newSubjectName.trim(),
      color: newSubjectColor
    });
    setNewSubjectName('');
    setNewSubjectColor('#6366f1');
    setEditingSubject(null);
    setShowEditSubject(false);
  };

  const handleDeleteSubject = (subject: any) => {
    if (window.confirm(`¿Estás seguro de eliminar "${subject.name}"? Se eliminarán todos sus parciales, tareas y materiales.`)) {
      deleteSubject(subject.id);
    }
  };

  const startPomodoro = (item: any, type: 'task' | 'topic' | 'material', subjectData: any) => {
    setPomodoroItem({
      id: item.id,
      title: item.title,
      color: subjectData.color,
      subjectName: subjectData.name,
      type
    });
  };

  const handlePomodoroComplete = (rating: number) => {
    if (!pomodoroItem || !activeProfileId) return;
    const duration = currentSettings?.work_duration || 25;
    addSession({
      profile_id: activeProfileId,
      task_id: pomodoroItem.type === 'task' ? pomodoroItem.id : undefined,
      exam_topic_id: pomodoroItem.type === 'topic' ? pomodoroItem.id : undefined,
      material_id: pomodoroItem.type === 'material' ? pomodoroItem.id : undefined,
      session_type: 'work',
      planned_duration_minutes: duration,
      duration_seconds: duration * 60,
      status: 'completed',
      focus_rating: rating,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
    setPomodoroItem(null);
  };

  if (!activeProfileId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Selecciona un perfil para ver tus materias</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 relative">
      {/* Header */}
      <div className="relative mb-6 md:mb-8">
        <div className={`relative p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl backdrop-blur-xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-slate-900/60 border-white/10'
            : 'bg-white/60 border-slate-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex-shrink-0">
                  <GraduationCap size={28} className="text-indigo-600 md:w-8 md:h-8" />
                  <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                  Mis Materias
                </h1>
              </div>
              <p className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Organiza tus parciales, temas y proyectos
              </p>
            </div>

            <button
              onClick={() => setShowAddSubject(true)}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span className="font-bold text-sm">Nueva Materia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar Materia */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-5 sm:p-6 md:p-8 rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'
          }`}>
            <h2 className="text-xl sm:text-2xl font-black mb-5 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Nueva Materia
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="ej: Cálculo Integral"
                  className={`w-full px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-lg"
                  />
                  <div className="flex-1 px-4 py-2.5 rounded-xl font-mono font-bold text-center text-sm" style={{
                    backgroundColor: newSubjectColor + '20',
                    color: newSubjectColor,
                    border: `2px solid ${newSubjectColor}50`
                  }}>
                    {newSubjectColor}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddSubject(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Materia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Materia */}
      {showEditSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-5 sm:p-6 md:p-8 rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'
          }`}>
            <h2 className="text-xl sm:text-2xl font-black mb-5 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Editar Materia
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="ej: Cálculo Integral"
                  className={`w-full px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-lg"
                  />
                  <div className="flex-1 px-4 py-2.5 rounded-xl font-mono font-bold text-center text-sm" style={{
                    backgroundColor: newSubjectColor + '20',
                    color: newSubjectColor,
                    border: `2px solid ${newSubjectColor}50`
                  }}>
                    {newSubjectColor}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditSubject(false);
                  setEditingSubject(null);
                  setNewSubjectName('');
                  setNewSubjectColor('#6366f1');
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditSubject}
                disabled={!newSubjectName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Materias */}
      {subjectsWithData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-24">
          <BookOpen size={64} className="text-slate-300 mb-4" />
          <h3 className="text-lg md:text-xl font-black text-slate-400 mb-2 text-center">No tienes materias aún</h3>
          <p className="text-slate-500 text-sm mb-6 text-center px-4">Comienza agregando tu primera materia</p>
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Agregar Materia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {subjectsWithData.map(({ subject, exams: subjectExams, topics, tasks: subjectTasks, materials: subjectMaterials }) => {
            const isExpanded = expandedSubjects.has(subject.id);
            const totalTasks = subjectTasks.length;
            const completedTasks = subjectTasks.filter(t => t.status === 'completed').length;
            const totalTopics = topics.length;
            const completedTopics = topics.filter(t => t.status === 'completed').length;

            return (
              <div
                key={subject.id}
                className="relative overflow-hidden rounded-xl sm:rounded-2xl"
              >
                <div className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border shadow-md transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-white/10 hover:bg-slate-900/90'
                    : 'bg-white/80 border-slate-200/60 hover:bg-white/95'
                }`}
                  style={{ borderLeft: `4px solid ${subject.color}` }}
                >
                  {/* Subject Header */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="flex-1 flex items-center gap-3 min-w-0"
                    >
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: subject.color + '20',
                          border: `2px solid ${subject.color}`
                        }}
                      >
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: subject.color }} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-black truncate" style={{ color: subject.color }}>
                          {subject.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] sm:text-xs font-bold">
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                            {subjectExams.length} Parciales
                          </span>
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                            {totalTasks} Tareas
                          </span>
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                            {totalTopics} Temas
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`}
                      />
                    </button>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditSubject(subject); }}
                        className={`p-2 rounded-lg transition-all active:scale-90 ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400'
                            : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSchedulesSubject(subject); }}
                        className={`p-2 rounded-lg transition-all active:scale-90 ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-purple-400'
                            : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                        title="Horarios"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject); }}
                        className={`p-2 rounded-lg transition-all active:scale-90 ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400'
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>TAREAS</span>
                        <span style={{ color: subject.color }}>{completedTasks}/{totalTasks}</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                            backgroundColor: subject.color
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>TEMAS</span>
                        <span style={{ color: subject.color }}>{completedTopics}/{totalTopics}</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}%`,
                            backgroundColor: subject.color
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content: Exams */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top duration-300">
                      {subjectExams.length === 0 ? (
                        <p className="text-center py-4 text-xs text-slate-400 font-medium">
                          No hay parciales registrados
                        </p>
                      ) : (
                        subjectExams.map((exam) => {
                          const isExamExpanded = expandedExams.has(exam.id);
                          const examTopicsList = topics.filter(t => t.exam_id === exam.id);

                          return (
                            <div key={exam.id} className="relative">
                              <div className={`p-3 sm:p-4 rounded-xl border transition-all ${
                                theme === 'dark'
                                  ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                              }`}>
                                <button
                                  onClick={() => toggleExam(exam.id)}
                                  className="w-full flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div
                                      className="p-1.5 rounded-lg flex-shrink-0"
                                      style={{
                                        backgroundColor: subject.color + '15',
                                        border: `1.5px solid ${subject.color}30`
                                      }}
                                    >
                                      <Target className="w-4 h-4" style={{ color: subject.color }} />
                                    </div>
                                    <div className="min-w-0 text-left">
                                      <h4 className="text-sm sm:text-base font-black truncate" style={{ color: subject.color }}>
                                        {exam.name}
                                      </h4>
                                      <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {examTopicsList.length} {examTopicsList.length === 1 ? 'tema' : 'temas'}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight
                                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isExamExpanded ? 'rotate-90' : ''}`}
                                    style={{ color: subject.color }}
                                  />
                                </button>

                                {/* Exam Topics */}
                                {isExamExpanded && (
                                  <div className="mt-3 space-y-2 animate-in fade-in duration-300">
                                    {examTopicsList.map((topic) => {
                                      const statusConfig = {
                                        completed: { bg: 'bg-green-500', label: 'Completado', icon: '✓' },
                                        in_progress: { bg: 'bg-yellow-500', label: 'En progreso', icon: '⟳' },
                                        pending: { bg: 'bg-slate-400', label: 'Pendiente', icon: '○' }
                                      };
                                      const status = statusConfig[topic.status as keyof typeof statusConfig] || statusConfig.pending;

                                      return (
                                        <div
                                          key={topic.id}
                                          className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border transition-all ${
                                            theme === 'dark'
                                              ? 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
                                              : 'bg-white/80 border-slate-200/50 hover:border-slate-300'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div
                                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-white text-[10px] ${status.bg}`}
                                              title={status.label}
                                            >
                                              {status.icon}
                                            </div>
                                            <div className="min-w-0">
                                              <span className="font-bold text-xs sm:text-sm block truncate">{topic.title}</span>
                                              <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {status.label}
                                              </span>
                                            </div>
                                          </div>

                                          <button
                                            onClick={() => startPomodoro(topic, 'topic', subject)}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                                            style={{
                                              background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)`,
                                              color: 'white'
                                            }}
                                          >
                                            <PlayCircle className="w-3.5 h-3.5" />
                                            <span>Estudiar</span>
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {/* Proyecto del Parcial */}
                                    <div className={`p-3 rounded-lg border border-dashed ${
                                      theme === 'dark'
                                        ? 'bg-slate-800/40 border-slate-600'
                                        : 'bg-slate-50/60 border-slate-300'
                                    }`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <FolderKanban className="w-4 h-4" style={{ color: subject.color }} />
                                        <h5 className="text-sm font-black" style={{ color: subject.color }}>
                                          Proyecto del Parcial
                                        </h5>
                                      </div>
                                      <button
                                        className="w-full sm:w-auto px-3 py-2 rounded-lg font-bold text-xs transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                                        style={{
                                          backgroundColor: subject.color + '20',
                                          color: subject.color,
                                          border: `1.5px solid ${subject.color}40`
                                        }}
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Agregar Proyecto</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Pomodoro */}
      {pomodoroItem && (
        <FullscreenPomodoro
          item={{
            title: pomodoroItem.title,
            color: pomodoroItem.color,
            subjectName: pomodoroItem.subjectName
          }}
          duration={currentSettings?.work_duration || 25}
          onClose={() => setPomodoroItem(null)}
          onComplete={handlePomodoroComplete}
        />
      )}

      {/* Edit Schedules Modal */}
      {editingSchedulesSubject && (
        <EditSubjectSchedules
          subjectId={editingSchedulesSubject.id}
          subjectName={editingSchedulesSubject.name}
          subjectColor={editingSchedulesSubject.color}
          onClose={() => setEditingSchedulesSubject(null)}
          theme={theme}
        />
      )}
    </div>
  );
};

export default SubjectsManager;
