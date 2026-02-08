/**
 * Selector de Tareas Flexible para Pomodoro
 * Permite seleccionar materias, exámenes, tareas directamente o con detalle
 */
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Subject, Exam, Task, ExamTopic, Material } from '../types';
import { GraduationCap, Target, CheckCircle2, BookOpen, ChevronDown, Flame, Layers, Zap } from 'lucide-react';
import { soundService } from '../lib/soundService';

type SelectionType = 'exam' | 'task' | 'material' | 'section';

interface SelectedItem {
  type: SelectionType;
  subject: any;
  item: any;
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
  const { subjects, tasks, exams, examTopics, materials, categoryInstances } = useAppStore();

  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<'subject' | 'category' | ''>('');
  const [selectedType, setSelectedType] = useState<SelectionType | ''>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedMetaId, setSelectedMetaId] = useState<string>('');

  // Materias from legacy subjects table
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  // Materias from category_instances (new system)
  const filteredCategories = useMemo(() => {
    return categoryInstances.filter(ci =>
      ci.profile_id === activeProfileId &&
      ci.category_type === 'materia' &&
      ci.is_active
    );
  }, [categoryInstances, activeProfileId]);

  // Combined sources: subjects + category instances (materias)
  const allSources = useMemo(() => {
    const sources: Array<{ id: string; name: string; color: string; type: 'subject' | 'category'; icon?: string }> = [];

    filteredSubjects.forEach(s => {
      sources.push({ id: s.id, name: s.name, color: s.color || '#6366f1', type: 'subject', icon: s.icon });
    });

    filteredCategories.forEach(ci => {
      // Avoid duplicates if a category has the same name as a subject
      if (!sources.some(s => s.name.toLowerCase() === ci.name.toLowerCase())) {
        sources.push({ id: ci.id, name: ci.name, color: ci.color || '#6366f1', type: 'category' });
      }
    });

    return sources;
  }, [filteredSubjects, filteredCategories]);

  // Available items based on selected source and type
  const availableItems = useMemo(() => {
    if (!selectedSourceId || !selectedType || selectedType === 'section') return [];

    if (selectedSourceType === 'category') return []; // Categories don't have sub-items

    switch (selectedType) {
      case 'exam':
        return exams.filter(e => e.subject_id === selectedSourceId && e.status !== 'completed');
      case 'task':
        return tasks.filter(t => t.subject_id === selectedSourceId && t.status !== 'completed');
      case 'material':
        return materials.filter(m => m.subject_id === selectedSourceId && m.status !== 'completed');
      default:
        return [];
    }
  }, [selectedSourceId, selectedSourceType, selectedType, exams, tasks, materials]);

  // Exam topics
  const availableMetas = useMemo(() => {
    if (selectedType !== 'exam' || !selectedItemId) return [];
    return examTopics.filter(et => et.exam_id === selectedItemId && et.status !== 'completed');
  }, [selectedItemId, selectedType, examTopics]);

  // Available types for the selected source
  const availableTypes = useMemo(() => {
    if (!selectedSourceId) return [];

    const types: Array<{ value: string; label: string; emoji: string; count?: number }> = [];

    // "Solo estudiar" option is always available
    types.push({ value: 'section', label: 'Solo estudiar (sin detalle)', emoji: '📖' });

    if (selectedSourceType === 'subject') {
      const subjectExams = exams.filter(e => e.subject_id === selectedSourceId && e.status !== 'completed');
      const subjectTasks = tasks.filter(t => t.subject_id === selectedSourceId && t.status !== 'completed');
      const subjectMaterials = materials.filter(m => m.subject_id === selectedSourceId && m.status !== 'completed');

      if (subjectExams.length > 0) types.push({ value: 'exam', label: 'Examen', emoji: '📝', count: subjectExams.length });
      if (subjectTasks.length > 0) types.push({ value: 'task', label: 'Tarea', emoji: '✅', count: subjectTasks.length });
      if (subjectMaterials.length > 0) types.push({ value: 'material', label: 'Material', emoji: '📚', count: subjectMaterials.length });
    }

    return types;
  }, [selectedSourceId, selectedSourceType, exams, tasks, materials]);

  const handleSourceChange = (value: string) => {
    soundService.playClick();
    const [type, id] = value.split(':');
    setSelectedSourceId(id || '');
    setSelectedSourceType(type as 'subject' | 'category' || '');
    setSelectedType('');
    setSelectedItemId('');
    setSelectedMetaId('');
  };

  const handleTypeChange = (type: string) => {
    soundService.playClick();

    if (type === 'section') {
      // Direct selection - just study the materia
      setSelectedType('section');
      const source = allSources.find(s => s.id === selectedSourceId);
      if (source) {
        soundService.playSuccess();
        soundService.vibrate([50, 100, 50]);
        onSelect({
          type: 'section',
          subject: source,
          item: source,
          displayTitle: source.name
        });
      }
      return;
    }

    setSelectedType(type as SelectionType);
    setSelectedItemId('');
    setSelectedMetaId('');
  };

  const handleItemChange = (itemId: string) => {
    soundService.playClick();
    setSelectedItemId(itemId);
    setSelectedMetaId('');

    // If not exam, finish selection immediately
    if (selectedType !== 'exam') {
      finishSelection(itemId, '');
    }
  };

  const handleMetaChange = (metaId: string) => {
    soundService.playClick();
    setSelectedMetaId(metaId);
    finishSelection(selectedItemId, metaId);
  };

  // Allow selecting exam directly without topic
  const handleSelectExamDirectly = () => {
    soundService.playClick();
    finishSelection(selectedItemId, '');
  };

  const finishSelection = (itemId: string, metaId: string) => {
    const source = allSources.find(s => s.id === selectedSourceId);
    if (!source || !selectedType || selectedType === 'section') return;

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
      subject: source,
      item,
      meta,
      displayTitle
    });
  };

  const selectBoxClasses = `w-full px-4 py-3 rounded-xl font-bold text-sm outline-none border-2 transition-all appearance-none ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
      : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
  }`;

  const labelClasses = `block text-[11px] font-black uppercase tracking-wider mb-1.5 ${
    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
  }`;

  return (
    <div className={`w-full p-4 sm:p-5 rounded-2xl border shadow-lg transition-all ${
      theme === 'dark'
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-100'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Target className="text-indigo-500" size={20} />
        </div>
        <div>
          <h3 className={`font-black text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Selecciona tu enfoque
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Elige qué vas a estudiar en este pomodoro
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Step 1: Source (Subject / Category) */}
        <div>
          <label className={labelClasses}>
            <GraduationCap size={12} className="inline mr-1.5" />
            1. Materia
          </label>
          <select
            value={selectedSourceId ? `${selectedSourceType}:${selectedSourceId}` : ''}
            onChange={(e) => handleSourceChange(e.target.value)}
            className={selectBoxClasses}
          >
            <option value="">-- Selecciona una materia --</option>
            {allSources.map(source => (
              <option key={`${source.type}:${source.id}`} value={`${source.type}:${source.id}`}>
                {source.icon || '📚'} {source.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Type (what to study) */}
        {selectedSourceId && availableTypes.length > 0 && (
          <div className="animate-in slide-in-from-top duration-300">
            <label className={labelClasses}>
              <Layers size={12} className="inline mr-1.5" />
              2. ¿Qué vas a hacer?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                    selectedType === type.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : theme === 'dark'
                        ? 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{type.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm truncate">{type.label}</p>
                      {type.count !== undefined && (
                        <p className="text-[10px] text-slate-400">{type.count} pendientes</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Specific item */}
        {selectedType && selectedType !== 'section' && availableItems.length > 0 && (
          <div className="animate-in slide-in-from-top duration-300">
            <label className={labelClasses}>
              <BookOpen size={12} className="inline mr-1.5" />
              3. {selectedType === 'exam' ? 'Examen' : selectedType === 'task' ? 'Tarea' : 'Material'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className={selectBoxClasses}
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

        {/* Step 4: Exam topic (optional for exams) */}
        {selectedType === 'exam' && selectedItemId && (
          <div className="animate-in slide-in-from-top duration-300">
            {availableMetas.length > 0 ? (
              <>
                <label className={labelClasses}>
                  <Flame size={12} className="inline mr-1.5" />
                  4. Tema (opcional)
                </label>
                <select
                  value={selectedMetaId}
                  onChange={(e) => handleMetaChange(e.target.value)}
                  className={selectBoxClasses}
                >
                  <option value="">-- Sin tema específico --</option>
                  {availableMetas.map(meta => (
                    <option key={meta.id} value={meta.id}>
                      🎯 {meta.title} ({meta.completed_pomodoros}/{meta.estimated_pomodoros} poms)
                    </option>
                  ))}
                </select>
                {/* Button to start without topic */}
                {!selectedMetaId && (
                  <button
                    onClick={handleSelectExamDirectly}
                    className="mt-2 w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap size={14} />
                    Estudiar examen sin tema específico
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleSelectExamDirectly}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                Estudiar este examen
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {selectedType && selectedType !== 'section' && selectedSourceType === 'subject' && availableItems.length === 0 && (
          <div className={`p-3 rounded-xl border-2 border-dashed text-center ${
            theme === 'dark'
              ? 'border-slate-700 text-slate-400'
              : 'border-slate-200 text-slate-500'
          }`}>
            <p className="text-xs font-medium">
              No hay {selectedType === 'exam' ? 'exámenes' : selectedType === 'task' ? 'tareas' : 'materiales'} pendientes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownTaskSelector;
