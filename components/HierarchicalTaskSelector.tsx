/**
 * Selector Jerárquico de Tareas para Pomodoro
 * Flujo: Materia → Tipo → Item → Tema/Meta → Pomodoro
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Subject, Exam, Task, ExamTopic, Material } from '../types';
import {
  GraduationCap, Target, CheckCircle2, BookOpen,
  ChevronRight, ChevronLeft, Flame, Sparkles
} from 'lucide-react';
import { soundService } from '../lib/soundService';

type SelectionType = 'exam' | 'task' | 'material';

interface SelectedItem {
  type: SelectionType;
  subject: Subject;
  item: Exam | Task | Material;
  meta?: ExamTopic; // Solo para exámenes
}

interface HierarchicalTaskSelectorProps {
  theme?: 'dark' | 'light';
  onSelect: (selection: SelectedItem) => void;
  activeProfileId: string;
}

export const HierarchicalTaskSelector: React.FC<HierarchicalTaskSelectorProps> = ({
  theme = 'dark',
  onSelect,
  activeProfileId
}) => {
  const { subjects, tasks, exams, examTopics, materials } = useAppStore();

  // Estados del flujo
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedType, setSelectedType] = useState<SelectionType | null>(null);
  const [selectedItem, setSelectedItem] = useState<Exam | Task | Material | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<ExamTopic | null>(null);

  // Filtrar materias por perfil
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  // Obtener items según el tipo seleccionado
  const availableItems = useMemo(() => {
    if (!selectedSubject || !selectedType) return [];

    switch (selectedType) {
      case 'exam':
        return exams.filter(e => e.subject_id === selectedSubject.id && e.status !== 'completed');
      case 'task':
        return tasks.filter(t => t.subject_id === selectedSubject.id && t.status !== 'completed');
      case 'material':
        return materials.filter(m => m.subject_id === selectedSubject.id && m.status !== 'completed');
      default:
        return [];
    }
  }, [selectedSubject, selectedType, exams, tasks, materials]);

  // Obtener temas del examen seleccionado
  const availableMetas = useMemo(() => {
    if (selectedType !== 'exam' || !selectedItem) return [];
    return examTopics.filter(et => et.exam_id === selectedItem.id && et.status !== 'completed');
  }, [selectedItem, selectedType, examTopics]);

  // Paso 1: Seleccionar Materia
  const handleSelectSubject = (subject: Subject) => {
    soundService.hapticFeedback('light');
    setSelectedSubject(subject);
    setSelectedType(null);
    setSelectedItem(null);
    setSelectedMeta(null);
    setStep(2);
  };

  // Paso 2: Seleccionar Tipo (Examen/Tarea/Material)
  const handleSelectType = (type: SelectionType) => {
    soundService.hapticFeedback('light');
    setSelectedType(type);
    setSelectedItem(null);
    setSelectedMeta(null);
    setStep(3);
  };

  // Paso 3: Seleccionar Item específico
  const handleSelectItem = (item: Exam | Task | Material) => {
    soundService.hapticFeedback('light');
    setSelectedItem(item);
    setSelectedMeta(null);

    // Si es examen, ir al paso 4 para seleccionar tema
    // Si es tarea o material, finalizar selección
    if (selectedType === 'exam') {
      setStep(4);
    } else {
      finishSelection(item, null);
    }
  };

  // Paso 4: Seleccionar Meta/Tema (solo para exámenes)
  const handleSelectMeta = (meta: ExamTopic) => {
    soundService.hapticFeedback('medium');
    setSelectedMeta(meta);
    finishSelection(selectedItem!, meta);
  };

  // Finalizar selección y notificar al padre
  const finishSelection = (item: Exam | Task | Material, meta: ExamTopic | null) => {
    if (!selectedSubject || !selectedType) return;

    soundService.playSuccess();
    soundService.vibrate([50, 100, 50]);

    onSelect({
      type: selectedType,
      subject: selectedSubject,
      item,
      meta: meta || undefined
    });
  };

  // Volver atrás
  const handleBack = () => {
    soundService.playClick();

    if (step === 4) {
      setSelectedMeta(null);
      setStep(3);
    } else if (step === 3) {
      setSelectedItem(null);
      setStep(2);
    } else if (step === 2) {
      setSelectedType(null);
      setSelectedSubject(null);
      setStep(1);
    }
  };

  // Renderizado según el paso
  return (
    <div className={`w-full p-6 rounded-3xl border-2 shadow-2xl transition-all ${
      theme === 'dark'
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-100'
    }`}>
      {/* Breadcrumb / Navegación */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            step === 1
              ? 'opacity-0 invisible'
              : theme === 'dark'
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ChevronLeft size={16} />
          Atrás
        </button>

        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {selectedSubject && (
            <>
              <div
                className="px-3 py-1 rounded-lg text-xs font-black flex items-center gap-2"
                style={{ backgroundColor: `${selectedSubject.color}20`, color: selectedSubject.color }}
              >
                <GraduationCap size={14} />
                {selectedSubject.name}
              </div>
              {selectedType && <ChevronRight size={14} className="text-slate-500" />}
            </>
          )}

          {selectedType && (
            <>
              <div className={`px-3 py-1 rounded-lg text-xs font-black ${
                theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {selectedType === 'exam' ? '📝 Examen' : selectedType === 'task' ? '✅ Tarea' : '📚 Material'}
              </div>
              {selectedItem && <ChevronRight size={14} className="text-slate-500" />}
            </>
          )}

          {selectedItem && (
            <div className={`px-3 py-1 rounded-lg text-xs font-black truncate max-w-[200px] ${
              theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              {(selectedItem as any).name || (selectedItem as any).title}
            </div>
          )}
        </div>
      </div>

      {/* Paso 1: Seleccionar Materia */}
      {step === 1 && (
        <div className="animate-in slide-in-from-right duration-300">
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <GraduationCap size={18} />
            Paso 1: Elige una Materia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSubjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => handleSelectSubject(subject)}
                className={`group relative p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  borderColor: subject.color + '40'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.icon || subject.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-base mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {subject.name}
                    </h4>
                    {subject.professor_name && (
                      <p className="text-xs text-slate-400">
                        {subject.professor_name}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                    size={20}
                  />
                </div>
              </button>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium">
                No hay materias disponibles. Crea una primero.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Seleccionar Tipo */}
      {step === 2 && (
        <div className="animate-in slide-in-from-right duration-300">
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Target size={18} />
            Paso 2: ¿Qué vas a estudiar?
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleSelectType('exam')}
              className={`group p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 hover:border-amber-500/50'
                  : 'bg-white border-slate-200 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl">
                  📝
                </div>
                <div className="flex-1">
                  <h4 className={`font-black text-xl mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Examen
                  </h4>
                  <p className="text-sm text-slate-400">
                    Preparar temas para un examen
                  </p>
                </div>
                <ChevronRight className="text-slate-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleSelectType('task')}
              className={`group p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl">
                  ✅
                </div>
                <div className="flex-1">
                  <h4 className={`font-black text-xl mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Tarea
                  </h4>
                  <p className="text-sm text-slate-400">
                    Completar una tarea pendiente
                  </p>
                </div>
                <ChevronRight className="text-slate-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleSelectType('material')}
              className={`group p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 hover:border-teal-500/50'
                  : 'bg-white border-slate-200 hover:border-teal-500/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-3xl">
                  📚
                </div>
                <div className="flex-1">
                  <h4 className={`font-black text-xl mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Material de Estudio
                  </h4>
                  <p className="text-sm text-slate-400">
                    Estudiar libro, artículo o video
                  </p>
                </div>
                <ChevronRight className="text-slate-500" size={24} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Seleccionar Item Específico */}
      {step === 3 && (
        <div className="animate-in slide-in-from-right duration-300">
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <CheckCircle2 size={18} />
            Paso 3: ¿Cuál {selectedType === 'exam' ? 'Examen' : selectedType === 'task' ? 'Tarea' : 'Material'}?
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {availableItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`group p-4 rounded-xl border-2 transition-all hover:scale-102 active:scale-98 text-left ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                    : 'bg-white border-slate-200 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    (item as any).priority === 'urgent' ? 'bg-red-500' :
                    (item as any).priority === 'high' ? 'bg-orange-500' :
                    (item as any).priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-bold text-base ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {(item as any).name || (item as any).title}
                    </h4>
                    {(item as Exam).exam_date && (
                      <p className="text-xs text-slate-400 mt-1">
                        📅 {new Date((item as Exam).exam_date).toLocaleDateString('es-ES')}
                      </p>
                    )}
                    {(item as Task).due_date && (
                      <p className="text-xs text-slate-400 mt-1">
                        📅 {new Date((item as Task).due_date).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="opacity-0 group-hover:opacity-100 text-slate-500" size={20} />
                </div>
              </button>
            ))}
          </div>

          {availableItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium">
                No hay {selectedType === 'exam' ? 'exámenes' : selectedType === 'task' ? 'tareas' : 'materiales'} pendientes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paso 4: Seleccionar Tema/Meta (solo exámenes) */}
      {step === 4 && selectedType === 'exam' && (
        <div className="animate-in slide-in-from-right duration-300">
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Flame size={18} />
            Paso 4: ¿Qué Tema vas a estudiar?
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {availableMetas.map(meta => (
              <button
                key={meta.id}
                onClick={() => handleSelectMeta(meta)}
                className={`group p-5 rounded-xl border-2 transition-all hover:scale-102 active:scale-98 text-left ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-indigo-500'
                    : 'bg-gradient-to-r from-white to-slate-50 border-slate-200 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Sparkles size={16} className="text-indigo-500" />
                      {meta.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        🎯 {meta.completed_pomodoros}/{meta.estimated_pomodoros} pomodoros
                      </span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{
                            width: `${(meta.completed_pomodoros / meta.estimated_pomodoros) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                </div>
              </button>
            ))}
          </div>

          {availableMetas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium mb-4">
                No hay temas pendientes para este examen.
              </p>
              <p className="text-xs text-slate-500">
                Crea temas desde la sección de Exámenes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HierarchicalTaskSelector;
