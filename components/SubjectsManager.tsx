import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import FullscreenPomodoro from './FullscreenPomodoro';
import {
  GraduationCap, Plus, BookOpen, FolderKanban, PlayCircle,
  ChevronDown, ChevronRight, Clock, Target, Sparkles, Flame
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
    addSubject, settings, addSession
  } = useAppStore();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [pomodoroItem, setPomodoroItem] = useState<PomodoroItem | null>(null);

  const currentSettings = activeProfileId ? settings[activeProfileId] : null;

  // Filtrar materias del perfil activo
  const activeSubjects = useMemo(() => {
    if (!activeProfileId) return [];
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  // Organizar datos por materia
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
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedSubjects(newSet);
  };

  const toggleExam = (id: string) => {
    const newSet = new Set(expandedExams);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedExams(newSet);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim() || !activeProfileId) return;

    addSubject({
      profile_id: activeProfileId,
      school_period_id: '', // Si usas períodos escolares
      name: newSubjectName.trim(),
      color: newSubjectColor
    });

    setNewSubjectName('');
    setNewSubjectColor('#6366f1');
    setShowAddSubject(false);
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
    <div className="min-h-screen p-8">
      {/* Header con glassmorphism */}
      <div className="relative mb-12">
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[4rem]">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className={`relative p-12 rounded-[3.5rem] backdrop-blur-2xl border-2 shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/40 border-white/10'
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <GraduationCap size={56} className="text-indigo-600 drop-shadow-lg" />
                  <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                </div>
                <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Mis Materias
                </h1>
              </div>
              <p className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Organiza tus parciales, temas y proyectos
              </p>
            </div>

            <button
              onClick={() => setShowAddSubject(true)}
              className="group relative px-8 py-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <Plus size={24} className="drop-shadow-lg" />
                <span className="font-black text-xl tracking-wide">Nueva Materia</span>
              </div>
              <div className="absolute inset-0 shimmer opacity-30" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar Materia */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300 ${
            theme === 'dark' ? 'bg-slate-900 border-2 border-white/10' : 'bg-white'
          }`}>
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Nueva Materia
            </h2>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-bold mb-3 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="ej: Cálculo Integral"
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-semibold text-lg transition-all focus:scale-[1.02] ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-3 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Color
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-24 h-24 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                  />
                  <div className="flex-1 px-6 py-4 rounded-2xl font-mono font-bold text-center" style={{
                    backgroundColor: newSubjectColor + '20',
                    color: newSubjectColor,
                    border: `2px solid ${newSubjectColor}50`
                  }}>
                    {newSubjectColor}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowAddSubject(false)}
                className={`flex-1 px-8 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 ${
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
                className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Crear Materia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Materias con Glassmorphism */}
      {subjectsWithData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <BookOpen size={120} className="text-slate-300 mb-8" />
          <h3 className="text-3xl font-black text-slate-400 mb-4">No tienes materias aún</h3>
          <p className="text-slate-500 text-lg mb-8">Comienza agregando tu primera materia</p>
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Agregar Materia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {subjectsWithData.map(({ subject, exams: subjectExams, topics, tasks: subjectTasks, materials: subjectMaterials }) => {
            const isExpanded = expandedSubjects.has(subject.id);
            const totalTasks = subjectTasks.length;
            const completedTasks = subjectTasks.filter(t => t.status === 'completed').length;
            const totalTopics = topics.length;
            const completedTopics = topics.filter(t => t.status === 'completed').length;

            return (
              <div
                key={subject.id}
                className="group relative animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${subjectsWithData.indexOf({ subject, exams: subjectExams, topics, tasks: subjectTasks, materials: subjectMaterials }) * 100}ms` }}
              >
                {/* Animated glow background */}
                <div
                  className="absolute -inset-1 rounded-[3rem] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ backgroundColor: subject.color }}
                />

                <div className={`relative p-8 rounded-[3rem] backdrop-blur-xl border-2 shadow-xl transition-all duration-500 ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 border-white/10 hover:bg-slate-900/80'
                    : 'bg-white/60 border-slate-200/50 hover:bg-white/80'
                }`}>
                  {/* Subject Header */}
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className="w-full flex items-center justify-between group/header"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover/header:scale-110 duration-300"
                        style={{
                          backgroundColor: subject.color + '20',
                          border: `3px solid ${subject.color}`
                        }}
                      >
                        <GraduationCap size={36} style={{ color: subject.color }} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-3xl font-black mb-1" style={{ color: subject.color }}>
                          {subject.name}
                        </h3>
                        <div className="flex gap-4 text-sm font-bold">
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                            {subjectExams.length} Parciales
                          </span>
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                            {totalTasks} Tareas
                          </span>
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                            {totalTopics} Temas
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="transition-transform duration-300" style={{
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                    }}>
                      <ChevronDown size={32} className="text-slate-400" />
                    </div>
                  </button>

                  {/* Progress Bars */}
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>TAREAS</span>
                        <span style={{ color: subject.color }}>{completedTasks}/{totalTasks}</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-1000 shadow-lg"
                          style={{
                            width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>TEMAS</span>
                        <span style={{ color: subject.color }}>{completedTopics}/{totalTopics}</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-1000 shadow-lg"
                          style={{
                            width: `${totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content: Parciales (Exams) */}
                  {isExpanded && (
                    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top duration-500">
                      {subjectExams.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 font-medium">
                          No hay parciales registrados
                        </p>
                      ) : (
                        subjectExams.map((exam) => {
                          const isExamExpanded = expandedExams.has(exam.id);
                          const examTopics = topics.filter(t => t.exam_id === exam.id);

                          return (
                            <div
                              key={exam.id}
                              className={`p-6 rounded-[2rem] border-2 transition-all ${
                                theme === 'dark'
                                  ? 'bg-slate-800/60 border-slate-700'
                                  : 'bg-white/60 border-slate-200'
                              }`}
                            >
                              <button
                                onClick={() => toggleExam(exam.id)}
                                className="w-full flex items-center justify-between group/exam"
                              >
                                <div className="flex items-center gap-3">
                                  <Target size={24} style={{ color: subject.color }} />
                                  <h4 className="text-xl font-black" style={{ color: subject.color }}>
                                    {exam.name}
                                  </h4>
                                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                                    backgroundColor: subject.color + '20',
                                    color: subject.color
                                  }}>
                                    {examTopics.length} temas
                                  </span>
                                </div>
                                <ChevronRight
                                  size={24}
                                  className={`transition-transform duration-300 ${isExamExpanded ? 'rotate-90' : ''}`}
                                  style={{ color: subject.color }}
                                />
                              </button>

                              {/* Exam Topics */}
                              {isExamExpanded && (
                                <div className="mt-6 space-y-3 animate-in fade-in duration-300">
                                  {examTopics.map((topic) => (
                                    <div
                                      key={topic.id}
                                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                                        theme === 'dark'
                                          ? 'bg-slate-900/60 border-slate-700 hover:bg-slate-900/80'
                                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <div
                                          className={`w-3 h-3 rounded-full ${
                                            topic.status === 'completed'
                                              ? 'bg-green-500'
                                              : topic.status === 'in_progress'
                                              ? 'bg-yellow-500'
                                              : 'bg-slate-400'
                                          }`}
                                        />
                                        <span className="font-bold">{topic.title}</span>
                                      </div>

                                      <button
                                        onClick={() => startPomodoro(topic, 'topic', subject)}
                                        className="group/btn relative px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-2 overflow-hidden"
                                        style={{
                                          backgroundColor: subject.color,
                                          color: 'white'
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        <PlayCircle size={18} className="relative z-10" />
                                        <span className="relative z-10">Estudiar</span>
                                        <Flame size={16} className="relative z-10 animate-pulse" />
                                      </button>
                                    </div>
                                  ))}

                                  {/* Proyecto del Parcial */}
                                  <div className={`p-6 rounded-2xl border-2 border-dashed mt-6 ${
                                    theme === 'dark'
                                      ? 'bg-slate-800/40 border-slate-600'
                                      : 'bg-slate-100/60 border-slate-300'
                                  }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                      <FolderKanban size={24} style={{ color: subject.color }} />
                                      <h5 className="text-lg font-black" style={{ color: subject.color }}>
                                        Proyecto del Parcial
                                      </h5>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                      Aquí puedes agregar el proyecto específico de este parcial
                                    </p>
                                    <button className={`mt-4 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 ${
                                      theme === 'dark'
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}>
                                      + Agregar Proyecto
                                    </button>
                                  </div>
                                </div>
                              )}
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
    </div>
  );
};

export default SubjectsManager;
