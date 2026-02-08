/**
 * CATEGORY VIEW - Vista específica de cada categoría
 * Diseño limpio con navegación por tabs horizontales
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { CategoryInstance } from '../types';
import {
  ArrowLeft, BookOpen, FileText, ClipboardList, Calendar,
  Play, Pause, BarChart3, Target, Dumbbell, Languages,
  Briefcase, FolderKanban, Clock, Coffee
} from 'lucide-react';

import ExamManager from './ExamManager';
import EnhancedTaskProgress from './EnhancedTaskProgress';
import PomodoroTimer from './PomodoroTimer';

interface CategoryViewProps {
  category: CategoryInstance;
  onBack: () => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const CategoryView: React.FC<CategoryViewProps> = ({ category, onBack }) => {
  const { theme } = useAppStore();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [pomodoroMode, setPomodoroMode] = useState<'sidebar' | 'fullscreen' | null>(null);

  const isDark = theme === 'dark';

  const getCategoryIcon = (type: string, size = 20) => {
    const icons: Record<string, any> = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Coffee size={size} />,
      'otro': <Calendar size={size} />
    };
    return icons[type] || icons.otro;
  };

  const getSections = () => {
    switch (category.category_type) {
      case 'materia':
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'exams', label: 'Exámenes', icon: FileText },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'stats', label: 'Stats', icon: BarChart3 },
        ];
      case 'gym':
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'routines', label: 'Rutinas', icon: Dumbbell },
          { id: 'progress', label: 'Progreso', icon: BarChart3 },
          { id: 'calendar', label: 'Calendario', icon: Calendar },
        ];
      case 'idioma':
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'lessons', label: 'Lecciones', icon: Languages },
          { id: 'vocabulary', label: 'Vocabulario', icon: BookOpen },
          { id: 'progress', label: 'Progreso', icon: BarChart3 },
        ];
      case 'trabajo':
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'projects', label: 'Proyectos', icon: Briefcase },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'hours', label: 'Horas', icon: Calendar },
        ];
      case 'proyecto':
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'milestones', label: 'Hitos', icon: FolderKanban },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'timeline', label: 'Timeline', icon: Calendar },
        ];
      default:
        return [
          { id: 'overview', label: 'General', icon: Target },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
          { id: 'calendar', label: 'Calendario', icon: Calendar },
        ];
    }
  };

  const sections = getSections();

  const renderContent = () => {
    if (category.category_type === 'materia') {
      switch (activeSection) {
        case 'exams': return <ExamManager />;
        case 'tasks': return <EnhancedTaskProgress />;
        case 'stats':
          return (
            <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
              <BarChart3 size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className="text-lg font-black">Estadísticas de {category.name}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Próximamente</p>
            </div>
          );
        default:
          return renderOverview();
      }
    }

    if (activeSection === 'overview') return renderOverview();

    return (
      <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
        <p className="text-lg font-black">{sections.find(s => s.id === activeSection)?.label}</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Próximamente para {category.category_type}
        </p>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Category info card */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="p-3 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            {getCategoryIcon(category.category_type, 24)}
          </div>
          <div>
            <h2 className="text-2xl font-black">{category.name}</h2>
            <p className={`text-sm font-medium capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {category.category_type} · {category.period_type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-white border border-slate-200'}`}>
            <Clock size={16} className={isDark ? 'text-slate-500 mb-1' : 'text-slate-400 mb-1'} />
            <p className="text-sm font-black">{category.schedule_start_time} - {category.schedule_end_time}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Horario</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-white border border-slate-200'}`}>
            <Calendar size={16} className={isDark ? 'text-slate-500 mb-1' : 'text-slate-400 mb-1'} />
            <p className="text-sm font-black">{category.times_per_week}x/semana</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Frecuencia</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-white border border-slate-200'}`}>
            <div className="flex gap-1 mb-1">
              {category.schedule_days.map(d => (
                <span
                  key={d}
                  className="w-5 h-5 rounded text-[8px] font-black flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {DAYS[d]?.charAt(0)}
                </span>
              ))}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Días</p>
          </div>
        </div>
      </div>

      {/* Quick stats for materia */}
      {category.category_type === 'materia' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <FileText size={20} className="text-amber-500" />, label: 'Exámenes', value: '0' },
            { icon: <ClipboardList size={20} className="text-indigo-500" />, label: 'Tareas', value: '0' },
            { icon: <BookOpen size={20} className="text-emerald-500" />, label: 'Materiales', value: '0' },
            { icon: <Target size={20} className="text-purple-500" />, label: 'Progreso', value: '0%' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/30 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              {stat.icon}
              <p className="text-2xl font-black mt-2">{stat.value}</p>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pomodoro quick start */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
      }`}>
        <div>
          <p className="font-black">Iniciar sesión de estudio</p>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Usa el pomodoro para enfocarte en {category.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPomodoroMode(pomodoroMode === 'sidebar' ? null : 'sidebar')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              pomodoroMode === 'sidebar'
                ? 'bg-indigo-600 text-white'
                : isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Play size={14} className="inline mr-1" /> Lateral
          </button>
          <button
            onClick={() => setPomodoroMode(pomodoroMode === 'fullscreen' ? null : 'fullscreen')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              pomodoroMode === 'fullscreen'
                ? 'bg-purple-600 text-white'
                : isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Play size={14} className="inline mr-1" /> Completo
          </button>
        </div>
      </div>
    </div>
  );

  if (pomodoroMode === 'fullscreen') {
    return (
      <div className={`max-w-7xl mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <button
          onClick={() => setPomodoroMode(null)}
          className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ArrowLeft size={16} /> Volver a {category.name}
        </button>
        <PomodoroTimer />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="p-2.5 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            {getCategoryIcon(category.category_type, 20)}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{category.name}</h1>
            <p className={`text-xs font-medium capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {category.category_type} · {category.schedule_start_time} - {category.schedule_end_time}
            </p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'text-white shadow-lg'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
              style={isActive ? { backgroundColor: category.color } : {}}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className={pomodoroMode === 'sidebar' ? 'flex-1' : 'w-full'}>
          {renderContent()}
        </div>
        {pomodoroMode === 'sidebar' && (
          <div className="w-80 flex-shrink-0">
            <PomodoroTimer />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;
