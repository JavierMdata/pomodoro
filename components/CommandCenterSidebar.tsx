/**
 * COMMAND CENTER SIDEBAR - Navegación lateral elegante
 * Inspirado en Notion, Linear, y Arc Browser
 * Organiza toda la vida en categorías visuales
 */
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { soundService } from '../lib/soundService';
import {
  LayoutDashboard, BookOpen, Languages, Briefcase, Dumbbell,
  FolderKanban, Library, Target, AlertCircle, FileText,
  BarChart3, Network, BookText, Settings, Calendar,
  ChevronDown, ChevronRight, Sparkles, Flame, Zap,
  Coffee
} from 'lucide-react';

interface SidebarSection {
  id: string;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  tab: string;
  badge?: number;
  color?: string;
}

interface CommandCenterSidebarProps {
  theme: 'dark' | 'light';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CommandCenterSidebar: React.FC<CommandCenterSidebarProps> = ({
  theme,
  activeTab,
  onTabChange
}) => {
  const { subjects, categoryInstances, tasks, exams, activeProfileId, sessions } = useAppStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['learn', 'grow', 'organize']);

  // Calcular badges y sections en un solo paso para evitar problemas de inicialización
  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const pendingTasks = tasks.filter(t => {
    const subject = profileSubjects.find(s => s.id === t.subject_id);
    return subject && t.status === 'pending';
  }).length;

  const upcomingExams = exams.filter(e => {
    const subject = profileSubjects.find(s => s.id === e.subject_id);
    return subject && e.status === 'upcoming';
  }).length;

  const todayPomodoros = sessions.filter(s => {
    const sessionDate = new Date(s.started_at);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const activeCategoriesCount = categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active).length;

  // Declarar sections directamente sin useMemo para evitar problemas de minificación
  const sections: SidebarSection[] = [
    {
      id: 'core',
      label: 'CENTRO DE MANDO',
      icon: Zap,
      color: '#6366F1',
      gradient: 'from-indigo-500 to-purple-500',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard', badge: todayPomodoros, color: '#6366F1' },
        { id: 'pomodoro', label: 'Pomodoro', icon: Flame, tab: 'pomodoro', color: '#F59E0B' },
      ]
    },
    {
      id: 'learn',
      label: 'APRENDER',
      icon: BookOpen,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500',
      items: [
        { id: 'subjects', label: 'Materias', icon: BookOpen, tab: 'subjects', badge: profileSubjects.length, color: '#8B5CF6' },
        { id: 'books', label: 'Libros', icon: Library, tab: 'books', color: '#EC4899' },
        { id: 'materials', label: 'Materiales', icon: FileText, tab: 'materials', color: '#A855F7' },
      ]
    },
    {
      id: 'grow',
      label: 'CRECER',
      icon: Sparkles,
      color: '#10B981',
      gradient: 'from-emerald-500 to-teal-500',
      items: [
        { id: 'categories', label: 'Mis Categorías', icon: FolderKanban, tab: 'categories', badge: activeCategoriesCount, color: '#10B981' },
        { id: 'projects', label: 'Proyectos', icon: Briefcase, tab: 'projects', color: '#14B8A6' },
        { id: 'gym', label: 'Gimnasio', icon: Dumbbell, tab: 'gym', color: '#059669' },
      ]
    },
    {
      id: 'organize',
      label: 'ORGANIZAR',
      icon: Target,
      color: '#F59E0B',
      gradient: 'from-amber-500 to-orange-500',
      items: [
        { id: 'tasks', label: 'Tareas', icon: Target, tab: 'tasks', badge: pendingTasks, color: '#F59E0B' },
        { id: 'exams', label: 'Exámenes', icon: AlertCircle, tab: 'exams', badge: upcomingExams, color: '#EF4444' },
        { id: 'schedule', label: 'Horarios', icon: Calendar, tab: 'schedule', color: '#F97316' },
      ]
    },
    {
      id: 'analyze',
      label: 'ANALIZAR',
      icon: BarChart3,
      color: '#06B6D4',
      gradient: 'from-cyan-500 to-blue-500',
      items: [
        { id: 'statistics', label: 'Estadísticas', icon: BarChart3, tab: 'statistics', color: '#06B6D4' },
        { id: 'graph', label: 'Grafo', icon: Network, tab: 'graph', color: '#3B82F6' },
        { id: 'journal', label: 'Journal', icon: BookText, tab: 'journal', color: '#0EA5E9' },
      ]
    },
    {
      id: 'config',
      label: 'CONFIGURAR',
      icon: Settings,
      color: '#64748B',
      gradient: 'from-slate-500 to-gray-500',
      items: [
        { id: 'periods', label: 'Períodos', icon: Calendar, tab: 'periods', color: '#64748B' },
        { id: 'settings', label: 'Ajustes', icon: Settings, tab: 'settings', color: '#475569' },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    soundService.playClick();
    soundService.vibrate(10);
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleItemClick = (tab: string) => {
    soundService.playSuccess();
    soundService.vibrate([30, 50, 30]);
    onTabChange(tab);
  };

  return (
    <div
      className={`w-72 h-screen fixed left-0 top-0 z-40 flex flex-col border-r backdrop-blur-2xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-slate-800'
          : 'bg-white/95 border-slate-200'
      }`}
    >
      {/* Header con logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
            <Flame className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              PomoSmart
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Command Center
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
                  theme === 'dark'
                    ? 'hover:bg-slate-800/50'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SectionIcon size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black tracking-widest text-slate-400">
                    {section.label}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={14} className="text-slate-400 transition-transform" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400 transition-transform" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="space-y-0.5 ml-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.tab;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.tab)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                          isActive
                            ? 'shadow-lg scale-[1.02]'
                            : theme === 'dark'
                            ? 'hover:bg-slate-800/80 active:bg-slate-800'
                            : 'hover:bg-slate-50 active:bg-slate-100'
                        }`}
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                          borderLeft: `3px solid ${item.color}`
                        } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'scale-110'
                                : 'group-hover:scale-110'
                            }`}
                            style={{
                              backgroundColor: isActive ? `${item.color}20` : 'transparent'
                            }}
                          >
                            <ItemIcon
                              size={16}
                              style={{ color: isActive ? item.color : undefined }}
                              className={!isActive ? 'text-slate-400 group-hover:text-slate-300' : ''}
                            />
                          </div>
                          <span
                            className={`text-sm font-bold transition-colors ${
                              isActive
                                ? 'text-slate-100'
                                : 'text-slate-400 group-hover:text-slate-300'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Badge */}
                        {item.badge !== undefined && item.badge > 0 && (
                          <div
                            className="px-2 py-0.5 rounded-full text-[10px] font-black"
                            style={{
                              backgroundColor: `${item.color}30`,
                              color: item.color
                            }}
                          >
                            {item.badge}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer con stats rápidas */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Coffee size={14} className="text-indigo-500" />
            <span className="font-bold text-slate-400">Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-black text-lg bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {todayPomodoros}
            </span>
            <span className="text-[10px] font-bold text-slate-400">pomos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterSidebar;
