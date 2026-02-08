
import React, { useState, useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import ModernLayout from './components/ModernLayout';
import ProfileCard from './components/ProfileCard';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import PomodoroTimer from './components/PomodoroTimer';
import StatisticsView from './components/StatisticsView';
import SubjectsManager from './components/SubjectsManager';
import ExamManager from './components/ExamManager';
import EnhancedTaskProgress from './components/EnhancedTaskProgress';
import BlockEditor from './components/BlockEditor';
import KnowledgeGraph from './components/KnowledgeGraph';
import FocusJournal from './components/FocusJournal';
import ProfileSettings from './components/ProfileSettings';
import WelcomeScreen from './components/WelcomeScreen';
import ProfileUnlock from './components/ProfileUnlock';
import PeriodManager from './components/PeriodManager';
import WorkScheduleManager from './components/WorkScheduleManager';
import CategoryManager from './components/CategoryManager';
import CommandCenterDashboard from './components/CommandCenterDashboard';
import BooksManager from './components/BooksManager';
import LandingPage from './components/LandingPage';
import { Plus, GraduationCap, Briefcase, Trash2, ArrowRight, CheckCircle2, Moon, Sun, Save } from 'lucide-react';
import { ProfileType, Gender, PomodoroSettings } from './types';

const BooksTabWrapper: React.FC = () => {
  const { books, subjects, activeProfileId, addBook, updateBook, deleteBook, addBookReadingSession, addBookQuote, theme } = useAppStore();
  const profileBooks = books.filter(b => b.profile_id === activeProfileId);
  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);

  if (!activeProfileId) return null;

  return (
    <BooksManager
      books={profileBooks}
      subjects={profileSubjects}
      onAddBook={addBook}
      onUpdateBook={updateBook}
      onDeleteBook={deleteBook}
      onAddReadingSession={addBookReadingSession}
      onAddQuote={addBookQuote}
      profileId={activeProfileId}
      theme={theme}
    />
  );
};

const App: React.FC = () => {
  const { theme, toggleTheme, profiles, activeProfileId, setActiveProfile, addProfile, deleteProfile, settings, updateSettings, syncWithSupabase } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileType, setNewProfileType] = useState<ProfileType>('universidad');
  const [newProfileName, setNewProfileName] = useState('');
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<Gender>('femenino');

  // Local state for settings form
  const [localSettings, setLocalSettings] = useState<PomodoroSettings | null>(null);

  // Estado para pantalla de bienvenida
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  // Estado para manejo de PIN
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const pendingProfile = profiles.find(p => p.id === pendingProfileId);

  // Get active profile (con protección contra undefined)
  const activeProfile = (profiles || []).find(p => p.id === activeProfileId);

  // Cargar datos de Supabase al iniciar
  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Verificar si el perfil activo necesita desbloqueo al cargar (SOLO UNA VEZ)
  const [hasCheckedPIN, setHasCheckedPIN] = useState(false);

  useEffect(() => {
    // Solo verificar una vez cuando hay perfiles cargados
    if (!hasCheckedPIN && activeProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === activeProfileId);
      const needsUnlock = localStorage.getItem('profile_needs_unlock');

      // Solo pedir PIN si está marcado como "needs_unlock" en localStorage
      if (profile && profile.requires_pin && profile.pin_hash && needsUnlock === activeProfileId) {
        setIsProfileLocked(true);
        setPendingProfileId(activeProfileId);
        setActiveProfile(null); // Desactivar hasta que se desbloquee
        localStorage.removeItem('profile_needs_unlock');
      }

      setHasCheckedPIN(true);
    }
  }, [profiles, activeProfileId, hasCheckedPIN]);

  useEffect(() => {
    if (activeProfileId && settings[activeProfileId]) {
      setLocalSettings(settings[activeProfileId]);
    }
  }, [activeProfileId, settings]);

  // Mostrar pantalla de bienvenida al seleccionar un perfil (solo si no hay PIN pendiente)
  useEffect(() => {
    if (activeProfileId && !pendingProfileId) {
      setShowWelcomeScreen(true);
    }
  }, [activeProfileId, pendingProfileId]);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim() && userName.trim()) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const color = colors[profiles.length % colors.length];
      addProfile({
        name: newProfileName,
        user_name: userName,
        gender: userGender,
        type: newProfileType,
        color: color,
        icon: 'user',
        user_id: 'local-user'
      });
      setShowCreateProfile(false);
      setNewProfileName('');
      setUserName('');
    }
  };

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("¿Seguro que quieres eliminar este perfil? Se perderán todos sus datos y configuraciones.")) {
          deleteProfile(id);
      }
  };

  const handleSaveSettings = () => {
    if (activeProfileId && localSettings) {
      updateSettings(activeProfileId, localSettings);
      alert("Configuración guardada correctamente.");
    }
  };

  // Manejar selección de perfil con verificación de PIN
  const handleSelectProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);

    if (profile && profile.requires_pin && profile.pin_hash) {
      // El perfil requiere PIN, mostrar pantalla de desbloqueo
      setPendingProfileId(profileId);
    } else {
      // El perfil no requiere PIN, activar directamente
      setActiveProfile(profileId);
    }
  };

  // Manejar desbloqueo exitoso
  const handleUnlockSuccess = () => {
    if (pendingProfileId) {
      setActiveProfile(pendingProfileId);
      setPendingProfileId(null);
      setIsProfileLocked(false);
    }
  };

  // Cancelar desbloqueo
  const handleUnlockCancel = () => {
    setPendingProfileId(null);
    setIsProfileLocked(false);
  };

  // Bloquear perfil cuando se cierra/minimiza la ventana
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Al cerrar/recargar, el perfil quedará bloqueado para el próximo inicio
      if (activeProfileId && activeProfile?.requires_pin) {
        localStorage.setItem('profile_needs_unlock', activeProfileId);
      }
    };

    const handleVisibilityChange = () => {
      // Si la página se oculta (minimizar/cambiar tab) y el perfil tiene auto-lock inmediato
      if (document.hidden && activeProfileId && activeProfile?.requires_pin) {
        // Guardar que necesita desbloqueo
        localStorage.setItem('profile_needs_unlock', activeProfileId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeProfileId, activeProfile]);

  // Mostrar pantalla de desbloqueo si hay un perfil pendiente (antes de todo)
  if (pendingProfile) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <ProfileUnlock
          profile={pendingProfile}
          onUnlock={handleUnlockSuccess}
          onCancel={handleUnlockCancel}
          theme={theme}
        />
      </div>
    );
  }

  // Profile Selector View - Nueva Landing Page
  if (!activeProfileId || showCreateProfile) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        {!showCreateProfile ? (
          // Mostrar landing page con listado de perfiles
          <LandingPage
            theme={theme}
            toggleTheme={toggleTheme}
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onCreateProfile={() => setShowCreateProfile(true)}
            onDeleteProfile={handleDeleteProfile}
          />
        ) : (
          // Mostrar formulario de creación de perfil
          <div className={`relative min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900'}`}>
            {/* Animated gradient border */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50" />

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '0s' }} />
              <div className="absolute top-1/2 right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }} />
            </div>

            <div className="absolute top-8 right-8">
              <button
                onClick={toggleTheme}
                className={`relative p-5 rounded-full border-2 transition-all hover:scale-110 active:scale-95 group ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                } backdrop-blur-xl shadow-lg`}
              >
                {theme === 'dark' ? <Sun size={24} className="group-hover:rotate-180 transition-transform duration-500" /> : <Moon size={24} className="group-hover:-rotate-12 transition-transform duration-300" />}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </button>
            </div>

            <div className="relative text-center mb-12 max-w-3xl animate-in fade-in slide-in-from-bottom duration-700">
              <div className="relative inline-block mb-6">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nuevo Perfil
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50" />
              </div>
            </div>

            <div className={`p-10 rounded-[3rem] shadow-2xl border w-full max-w-lg animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Nombre Perfil</label>
                    <input type="text" required value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-none' : 'bg-slate-50 border-none'}`} placeholder="Ej: Universidad" />
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Tu Nombre</label>
                    <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-none' : 'bg-slate-50 border-none'}`} placeholder="Ej: María" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Tipo</label>
                    <select value={newProfileType} onChange={(e) => setNewProfileType(e.target.value as ProfileType)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}>
                        <option value="universidad">Universidad</option>
                        <option value="trabajo">Trabajo</option>
                        <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Género</label>
                    <select value={userGender} onChange={(e) => setUserGender(e.target.value as Gender)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}>
                        <option value="femenino">Femenino</option>
                        <option value="masculino">Masculino</option>
                        <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateProfile(false)} className={`flex-1 p-4 font-bold rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}>Cancelar</button>
                  <button type="submit" className="flex-1 p-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    Comenzar <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper para extraer ID de categoría de tabs dinámicos
  const getCategoryInstanceIdFromTab = (tab: string): string | null => {
    if (tab.startsWith('category-instance-')) {
      return tab.replace('category-instance-', '');
    }
    return null;
  };

  const categoryInstanceId = getCategoryInstanceIdFromTab(activeTab);

  // Active Profile Main View
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <ModernLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && <CommandCenterDashboard />}
          {activeTab === 'periods' && <PeriodManager />}
          {activeTab === 'schedule' && <WorkScheduleManager />}
          {activeTab === 'categories' && <CategoryManager filterType="all" />}
          {activeTab === 'subjects' && <SubjectsManager />}
          {activeTab === 'books' && <BooksTabWrapper />}
          {activeTab === 'exams' && <ExamManager />}
          {activeTab === 'tasks' && <EnhancedTaskProgress />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'statistics' && <StatisticsView />}
          {activeTab === 'notes' && <BlockEditor />}
          {activeTab === 'graph' && <KnowledgeGraph />}
          {activeTab === 'journal' && <FocusJournal />}
          {activeTab === 'settings' && <ProfileSettings />}
          {activeTab === 'projects' && <CategoryManager filterType="proyecto" />}
          {activeTab === 'gym' && <CategoryManager filterType="gym" />}
          {/* Tabs dinámicos para categorías individuales */}
          {categoryInstanceId && <CategoryManager categoryInstanceId={categoryInstanceId} />}
        </div>
      </ModernLayout>

      {/* Pantalla de Bienvenida */}
      {showWelcomeScreen && activeProfile && (
        <WelcomeScreen
          profile={activeProfile}
          onDismiss={() => setShowWelcomeScreen(false)}
        />
      )}
    </div>
  );
};

export default App;
