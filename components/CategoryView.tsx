/**
 * CATEGORY VIEW - Vista específica de cada categoría
 * Muestra opciones según el tipo: Materias→Exámenes/Tareas, Gym→Rutinas, etc.
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance } from '../types';
import {
  ArrowLeft, BookOpen, FileText, ClipboardList, Calendar,
  Play, Pause, BarChart3, Target, Dumbbell, Languages,
  Briefcase, FolderKanban
} from 'lucide-react';

// Importar componentes existentes
import ExamManager from './ExamManager';
import EnhancedTaskProgress from './EnhancedTaskProgress';
import MaterialManager from './MaterialManager';
import PomodoroTimer from './PomodoroTimer';

interface CategoryViewProps {
  category: CategoryInstance;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, onBack }) => {
  const { theme } = useAppStore();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [pomodoroMode, setPomodoroMode] = useState<'sidebar' | 'fullscreen' | null>(null);

  // Secciones según tipo de categoría
  const getSections = () => {
    switch (category.category_type) {
      case 'materia':
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'exams', label: 'Exámenes', icon: FileText },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'materials', label: 'Materiales', icon: BookOpen },
          { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
        ];
      case 'gym':
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'routines', label: 'Rutinas', icon: Dumbbell },
          { id: 'progress', label: 'Progreso', icon: BarChart3 },
          { id: 'calendar', label: 'Calendario', icon: Calendar },
        ];
      case 'idioma':
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'lessons', label: 'Lecciones', icon: Languages },
          { id: 'vocabulary', label: 'Vocabulario', icon: BookOpen },
          { id: 'progress', label: 'Progreso', icon: BarChart3 },
        ];
      case 'trabajo':
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'projects', label: 'Proyectos', icon: Briefcase },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'hours', label: 'Horas', icon: Calendar },
        ];
      case 'proyecto':
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'milestones', label: 'Hitos', icon: FolderKanban },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'timeline', label: 'Timeline', icon: Calendar },
        ];
      default:
        return [
          { id: 'overview', label: 'Vista General', icon: Target },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'calendar', label: 'Calendario', icon: Calendar },
        ];
    }
  };

  const sections = getSections();

  const renderContent = () => {
    // Para materias, usar los componentes existentes
    if (category.category_type === 'materia') {
      switch (activeSection) {
        case 'exams':
          return <ExamManager />;
        case 'tasks':
          return <EnhancedTaskProgress />;
        case 'materials':
          return <MaterialManager />;
        case 'stats':
          return (
            <div className="p-6 text-center">
              <BarChart3 size={48} className="mx-auto text-slate-400 mb-3" />
              <p className="text-lg font-bold">Estadísticas de {category.name}</p>
              <p className="text-slate-400">Próximamente...</p>
            </div>
          );
        default:
          return (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">{category.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
                  <FileText className="text-amber-500 mb-2" size={24} />
                  <p className="font-bold">Exámenes</p>
                  <p className="text-2xl font-black">0</p>
                </div>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
                  <ClipboardList className="text-indigo-500 mb-2" size={24} />
                  <p className="font-bold">Tareas</p>
                  <p className="text-2xl font-black">0</p>
                </div>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
                  <BookOpen className="text-emerald-500 mb-2" size={24} />
                  <p className="font-bold">Materiales</p>
                  <p className="text-2xl font-black">0</p>
                </div>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
                  <Target className="text-purple-500 mb-2" size={24} />
                  <p className="font-bold">Progreso</p>
                  <p className="text-2xl font-black">0%</p>
                </div>
              </div>
            </div>
          );
      }
    }

    // Para otros tipos, placeholder
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-bold">Sección: {sections.find(s => s.id === activeSection)?.label}</p>
        <p className="text-slate-400 mt-2">Próximamente para categoría tipo {category.category_type}</p>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex gap-4">
        {/* Sidebar con navegación */}
        <div className={`w-64 flex-shrink-0 space-y-2 ${pomodoroMode === 'fullscreen' ? 'hidden' : ''}`}>
          {/* Header con Back */}
          <button
            onClick={onBack}
            className={`w-full p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
              theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-50 border'
            }`}
          >
            <ArrowLeft size={20} />
            Volver a Categorías
          </button>

          {/* Categoría actual */}
          <div
            className={`p-4 rounded-xl border-l-4`}
            style={{ borderLeftColor: category.color }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="p-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: category.color }}
              >
                {category.icon || '📚'}
              </div>
              <div>
                <h3 className="font-black">{category.name}</h3>
                <p className="text-xs text-slate-400">{category.category_type}</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              <p>{category.schedule_start_time} - {category.schedule_end_time}</p>
              <p>{category.times_per_week}x por semana</p>
            </div>
          </div>

          {/* Pomodoro Controls */}
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
            <p className="text-xs font-bold text-slate-400 mb-2">POMODORO</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPomodoroMode(pomodoroMode === 'sidebar' ? null : 'sidebar')}
                className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                  pomodoroMode === 'sidebar'
                    ? 'bg-indigo-600 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Lateral
              </button>
              <button
                onClick={() => setPomodoroMode(pomodoroMode === 'fullscreen' ? null : 'fullscreen')}
                className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${
                  pomodoroMode === 'fullscreen'
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Completo
              </button>
            </div>
          </div>

          {/* Secciones */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 px-2 mb-2">SECCIONES</p>
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full p-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${
                    activeSection === section.id
                      ? 'text-white'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={
                    activeSection === section.id
                      ? { backgroundColor: category.color }
                      : {}
                  }
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${pomodoroMode === 'fullscreen' ? 'w-full' : ''}`}>
          {pomodoroMode === 'fullscreen' ? (
            <div>
              <button
                onClick={() => setPomodoroMode(null)}
                className="mb-4 px-4 py-2 bg-slate-800 rounded-lg font-bold"
              >
                ← Volver
              </button>
              <PomodoroTimer />
            </div>
          ) : (
            <div className="flex gap-4">
              <div className={pomodoroMode === 'sidebar' ? 'flex-1' : 'w-full'}>
                {renderContent()}
              </div>
              {pomodoroMode === 'sidebar' && (
                <div className="w-80 flex-shrink-0">
                  <PomodoroTimer />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
