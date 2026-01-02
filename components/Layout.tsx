
import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  ClipboardList, BookOpen, Timer, BarChart3, Settings, 
  LogOut, LayoutGrid, LayoutDashboard, GraduationCap, FileText,
  Moon, Sun
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { theme, toggleTheme, profiles, activeProfileId, setActiveProfile } = useAppStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'subjects', label: 'Materias', icon: GraduationCap },
    { id: 'exams', label: 'Exámenes', icon: FileText },
    { id: 'tasks', label: 'Tareas', icon: ClipboardList },
    { id: 'materials', label: 'Materiales', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'statistics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  if (!activeProfile) return <>{children}</>;

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col sticky top-0 h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-8 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: activeProfile.color }}>
              {activeProfile.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 className={`font-black leading-none truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{activeProfile.name}</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>{activeProfile.type}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveProfile(null)}
              className={`w-full flex items-center justify-center gap-2 py-3 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${theme === 'dark' ? 'border-slate-600 text-indigo-400 hover:bg-slate-700' : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}
            >
              <LayoutGrid size={14} />
              Cambiar Perfil
            </button>
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center gap-2 py-3 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${theme === 'dark' ? 'border-slate-600 text-amber-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100/20' 
                  : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} strokeWidth={2.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group">
            <LogOut size={20} strokeWidth={2.5} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
