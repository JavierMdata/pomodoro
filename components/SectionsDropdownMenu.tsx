/**
 * SectionsDropdownMenu - Menú desplegable de secciones
 * Muestra todas las categorías/materias en un menú desplegable simple
 * Al seleccionar una, navega al Pomodoro con esa sección preseleccionada
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { soundService } from '../lib/soundService';
import {
  Menu, BookOpen, Languages, Briefcase, Dumbbell,
  FolderKanban, Coffee, MoreHorizontal, ChevronDown
} from 'lucide-react';

interface SectionsDropdownMenuProps {
  theme?: 'dark' | 'light';
  onSelectSection: (sectionId: string, sectionType: 'subject' | 'category') => void;
}

const SectionsDropdownMenu: React.FC<SectionsDropdownMenuProps> = ({
  theme = 'dark',
  onSelectSection
}) => {
  const { activeProfileId, subjects, categoryInstances } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar por perfil activo
  const profileSubjects = useMemo(() => {
    return subjects.filter(s => s.profile_id === activeProfileId);
  }, [subjects, activeProfileId]);

  const profileCategories = useMemo(() => {
    return categoryInstances.filter(ci => ci.profile_id === activeProfileId && ci.is_active);
  }, [categoryInstances, activeProfileId]);

  // Combinar todas las secciones
  const allSections = useMemo(() => {
    const sections: Array<{
      id: string;
      name: string;
      color: string;
      type: 'subject' | 'category';
      categoryType?: string;
      icon: any;
    }> = [];

    // Agregar subjects
    profileSubjects.forEach(subject => {
      sections.push({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        type: 'subject',
        categoryType: 'materia',
        icon: <BookOpen size={18} />
      });
    });

    // Agregar category instances
    profileCategories.forEach(category => {
      const icon = getCategoryIcon(category.category_type);
      sections.push({
        id: category.id,
        name: category.name,
        color: category.color,
        type: 'category',
        categoryType: category.category_type,
        icon
      });
    });

    return sections.sort((a, b) => a.name.localeCompare(b.name));
  }, [profileSubjects, profileCategories]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    soundService.playClick();
    soundService.vibrate(15);
    setIsOpen(!isOpen);
  };

  const handleSelectSection = (section: typeof allSections[0]) => {
    soundService.playSuccess();
    soundService.vibrate([50, 100, 50]);
    setIsOpen(false);
    onSelectSection(section.id, section.type);
  };

  const getCategoryIcon = (type: string, size = 18) => {
    const icons: Record<string, any> = {
      'materia': <BookOpen size={size} />,
      'idioma': <Languages size={size} />,
      'trabajo': <Briefcase size={size} />,
      'gym': <Dumbbell size={size} />,
      'proyecto': <FolderKanban size={size} />,
      'descanso': <Coffee size={size} />,
      'otro': <MoreHorizontal size={size} />
    };
    return icons[type] || icons.otro;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del menú */}
      <button
        onClick={handleToggle}
        className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all hover:scale-110 active:scale-95 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 ${
          theme === 'dark'
            ? 'bg-slate-800 text-white hover:bg-slate-700'
            : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-200'
        }`}
        aria-label="Menú de secciones"
      >
        <Menu size={18} className="md:w-5 md:h-5" />
        <ChevronDown
          size={16}
          className={`md:w-4 md:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-2 w-72 md:w-80 max-h-[70vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-slate-800'
              : 'bg-white/95 border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-slate-800/50 backdrop-blur-xl z-10">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">
              Tus Secciones
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {allSections.length} secciones disponibles
            </p>
          </div>

          {/* Lista de secciones */}
          {allSections.length === 0 ? (
            <div className="p-8 text-center">
              <Menu size={48} className="mx-auto text-slate-400 mb-3 opacity-50" />
              <p className="text-sm text-slate-400">
                No hay secciones disponibles
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Crea materias o categorías para verlas aquí
              </p>
            </div>
          ) : (
            <div className="p-2">
              {allSections.map((section) => (
                <button
                  key={`${section.type}-${section.id}`}
                  onClick={() => handleSelectSection(section)}
                  className={`w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 group ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 active:bg-slate-700'
                      : 'hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  {/* Icono con color */}
                  <div
                    className="p-2 rounded-lg text-white flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: section.color }}
                  >
                    {section.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">
                      {section.name}
                    </h4>
                    <p className="text-xs text-slate-400 capitalize">
                      {section.categoryType}
                    </p>
                  </div>

                  {/* Indicador de hover */}
                  <div
                    className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: section.color }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionsDropdownMenu;
