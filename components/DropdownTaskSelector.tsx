/**
 * Selector de Tareas con Menús Desplegables
 * Más simple y compacto que el jerárquico
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Subject, Exam, Task, ExamTopic, Material } from '../types';
import { GraduationCap, Target, CheckCircle2, BookOpen, ChevronDown, Flame } from 'lucide-react';
import { soundService } from '../lib/soundService';

type SelectionType = 'exam' | 'task' | 'material';

interface SelectedItem {
  type: SelectionType;
  subject: Subject;
  item: Exam | Task | Material;
  meta?: ExamTopic;
  displayTitle: string;
}

interface DropdownTaskSelectorProps {
  theme?: 'dark' | 'light';
  onSelect: (selection: SelectedItem) => void;
  activeProfileId: string;
}

export const DropdownTaskSelector: React.FC<DropdownTaskSelectorProps> = ({
  theme = 'dark',
  onSelect,
  activeProfileId
}) => {
  const { subjects, tasks, exams, examTopics, materials } = useAppStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<SelectionType | ''>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedMetaId, setSelectedMetaId] = useState<string>('');

  // Filtrar materias por perfil
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  // Obtener items según tipo y materia
  const availableItems = useMemo(() => {
    if (!selectedSubjectId || !selectedType) return [];

    switch (selectedType) {
      case 'exam':
        return exams.filter(e => e.subject_id === selectedSubjectId && e.status !== 'completed');
      case 'task':
        return tasks.filter(t => t.subject_id === selectedSubjectId && t.status !== 'completed');
      case 'material':
        return materials.filter(m => m.subject_id === selectedSubjectId && m.status !== 'completed');
      default:
        return [];
    }
  }, [selectedSubjectId, selectedType, exams, tasks, materials]);

  // Obtener temas del examen
  const availableMetas = useMemo(() => {
    if (selectedType !== 'exam' || !selectedItemId) return [];
    return examTopics.filter(et => et.exam_id === selectedItemId && et.status !== 'completed');
  }, [selectedItemId, selectedType, examTopics]);

  // Manejar selección de materia
  const handleSubjectChange = (subjectId: string) => {
    soundService.playClick();
    setSelectedSubjectId(subjectId);
    setSelectedType('');
    setSelectedItemId('');
    setSelectedMetaId('');
  };

  // Manejar selección de tipo
  const handleTypeChange = (type: string) => {
    soundService.playClick();
    setSelectedType(type as SelectionType);
    setSelectedItemId('');
    setSelectedMetaId('');
  };

  // Manejar selección de item
  const handleItemChange = (itemId: string) => {
    soundService.playClick();
    setSelectedItemId(itemId);
    setSelectedMetaId('');

    // Si no es examen, finalizar selección
    if (selectedType !== 'exam') {
      finishSelection(itemId, '');
    }
  };

  // Manejar selección de tema (solo exámenes)
  const handleMetaChange = (metaId: string) => {
    soundService.playClick();
    setSelectedMetaId(metaId);
    finishSelection(selectedItemId, metaId);
  };

  // Finalizar y notificar selección
  const finishSelection = (itemId: string, metaId: string) => {
    const subject = filteredSubjects.find(s => s.id === selectedSubjectId);
    if (!subject || !selectedType) return;

    let item: any;
    switch (selectedType) {
      case 'exam':
        item = exams.find(e => e.id === itemId);
        break;
      case 'task':
        item = tasks.find(t => t.id === itemId);
        break;
      case 'material':
        item = materials.find(m => m.id === itemId);
        break;
    }

    if (!item) return;

    const meta = metaId ? examTopics.find(et => et.id === metaId) : undefined;

    const displayTitle = meta
      ? `${meta.title} (${item.name || item.title})`
      : item.name || item.title;

    soundService.playSuccess();
    soundService.vibrate([50, 100, 50]);

    onSelect({
      type: selectedType,
      subject,
      item,
      meta,
      displayTitle
    });
  };

  return (
    <div className={`w-full p-6 rounded-3xl border-2 shadow-xl transition-all ${
      theme === 'dark'
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-100'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Target className="text-indigo-500" size={24} />
        </div>
        <div>
          <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Selecciona tu enfoque
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Elige qué vas a estudiar en este pomodoro
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Paso 1: Materia */}
        <div>
          <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <GraduationCap size={14} className="inline mr-2" />
            1. Materia
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl font-bold text-base outline-none border-2 transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          >
            <option value="">-- Selecciona una materia --</option>
            {filteredSubjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.icon || '📚'} {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Paso 2: Tipo (solo si hay materia seleccionada) */}
        {selectedSubjectId && (
          <div className="animate-in slide-in-from-top duration-300">
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <CheckCircle2 size={14} className="inline mr-2" />
              2. ¿Qué vas a estudiar?
            </label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl font-bold text-base outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            >
              <option value="">-- Selecciona el tipo --</option>
              <option value="exam">📝 Examen (preparar temas)</option>
              <option value="task">✅ Tarea (completar trabajo)</option>
              <option value="material">📚 Material de Estudio</option>
            </select>
          </div>
        )}

        {/* Paso 3: Item específico */}
        {selectedType && availableItems.length > 0 && (
          <div className="animate-in slide-in-from-top duration-300">
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <BookOpen size={14} className="inline mr-2" />
              3. {selectedType === 'exam' ? 'Examen' : selectedType === 'task' ? 'Tarea' : 'Material'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl font-bold text-base outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            >
              <option value="">-- Selecciona uno --</option>
              {availableItems.map(item => {
                const priority = (item as any).priority;
                const emoji = priority === 'urgent' ? '🔥' : priority === 'high' ? '⚠️' : priority === 'medium' ? '📌' : '📋';
                return (
                  <option key={item.id} value={item.id}>
                    {emoji} {(item as any).name || (item as any).title}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Paso 4: Tema del examen (solo si es examen) */}
        {selectedType === 'exam' && selectedItemId && availableMetas.length > 0 && (
          <div className="animate-in slide-in-from-top duration-300">
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Flame size={14} className="inline mr-2" />
              4. Tema a estudiar
            </label>
            <select
              value={selectedMetaId}
              onChange={(e) => handleMetaChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl font-bold text-base outline-none border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            >
              <option value="">-- Selecciona un tema --</option>
              {availableMetas.map(meta => (
                <option key={meta.id} value={meta.id}>
                  🎯 {meta.title} ({meta.completed_pomodoros}/{meta.estimated_pomodoros} pomodoros)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mensaje si no hay items */}
        {selectedType && availableItems.length === 0 && (
          <div className={`p-4 rounded-xl border-2 border-dashed text-center ${
            theme === 'dark'
              ? 'border-slate-700 text-slate-400'
              : 'border-slate-200 text-slate-500'
          }`}>
            <p className="text-sm font-medium">
              No hay {selectedType === 'exam' ? 'exámenes' : selectedType === 'task' ? 'tareas' : 'materiales'} pendientes para esta materia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownTaskSelector;
