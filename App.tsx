
import React, { useState, useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ModernLayout from './components/ModernLayout';
import ProfileCard from './components/ProfileCard';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import MaterialManager from './components/MaterialManager';
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
import WelcomePage from './components/WelcomePage';
import { Plus, GraduationCap, Briefcase, Trash2, ArrowRight, CheckCircle2, Moon, Sun, Save, LogOut, User, Crown } from 'lucide-react';
import { ProfileType, Gender, PomodoroSettings } from './types';
import { getCurrentUserId } from './lib/supabase';

// ============================================================================
// COMPONENTE PRINCIPAL CON AUTENTICACION
// ============================================================================

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user, userProfile, signOut } = useAuth();
  const {
    theme,
    toggleTheme,
    profiles,
    activeProfileId,
    setActiveProfile,
    addProfile,
    deleteProfile,
    settings,
    updateSettings,
    syncWithSupabase
  } = useAppStore();

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
  const pendingProfile = profiles.find(p => p.id === pendingProfileId);

  // Get active profile (con proteccion contra undefined)
  const activeProfile = (profiles || []).find(p => p.id === activeProfileId);

  // Cargar datos de Supabase cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Usuario autenticado, sincronizando datos...');
      syncWithSupabase();
    }
  }, [isAuthenticated, user, syncWithSupabase]);

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

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim() && userName.trim()) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const color = colors[profiles.length % colors.length];

      // Obtener el user_id del usuario autenticado
      const userId = await getCurrentUserId();

      if (!userId) {
        alert('Error: No se pudo obtener el usuario autenticado');
        return;
      }

      await addProfile({
        name: newProfileName,
        user_name: userName,
        gender: userGender,
        type: newProfileType,
        color: color,
        icon: 'user',
        user_id: userId // Usar el ID del usuario autenticado
      });
      setShowCreateProfile(false);
      setNewProfileName('');
      setUserName('');
    }
  };

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Seguro que quieres eliminar este perfil? Se perderan todos sus datos y configuraciones.")) {
      deleteProfile(id);
    }
  };

  const handleSaveSettings = () => {
    if (activeProfileId && localSettings) {
      updateSettings(activeProfileId, localSettings);
      alert("Configuracion guardada correctamente.");
    }
  };

  // Manejar seleccion de perfil con verificacion de PIN
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
    }
  };

  // Cancelar desbloqueo
  const handleUnlockCancel = () => {
    setPendingProfileId(null);
  };

  // Manejar cierre de sesion
  const handleLogout = async () => {
    if (window.confirm('Seguro que quieres cerrar sesion?')) {
      setActiveProfile(null);
      await signOut();
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (authLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4" />
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
          Cargando...
        </p>
      </div>
    );
  }

  // ============================================================================
  // PAGINA DE BIENVENIDA (NO AUTENTICADO)
  // ============================================================================

  if (!isAuthenticated) {
    return <WelcomePage theme={theme} toggleTheme={toggleTheme} />;
  }

  // ============================================================================
  // SELECTOR DE PERFILES (AUTENTICADO, SIN PERFIL ACTIVO)
  // ============================================================================

  if (!activeProfileId) {
    return (
      <div className={`relative min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900'}`}>
        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50" />

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/2 right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }} />
        </div>

        {/* Header con info de usuario y botones */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          {/* Info del usuario */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{userProfile?.full_name || user?.email}</p>
              <div className="flex items-center gap-1">
                <Crown size={12} className={userProfile?.plan === 'premium' || userProfile?.plan === 'lifetime' ? 'text-amber-500' : 'text-slate-400'} />
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Plan {userProfile?.plan || 'free'}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de accion */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`relative p-4 rounded-full border-2 transition-all hover:scale-110 active:scale-95 group ${
                theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
              } backdrop-blur-xl shadow-lg`}
            >
              {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-180 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-300" />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
                  : 'bg-white/80 border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200'
              } backdrop-blur-xl shadow-lg`}
            >
              <LogOut size={18} />
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </div>

        <div className="relative text-center mb-20 max-w-3xl animate-in fade-in slide-in-from-bottom duration-700">
          <div className="relative inline-block mb-8">
            <h1 className="text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PomoSmart
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50" />
          </div>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-2xl font-bold leading-relaxed`}>
            Tu centro de comando academico definitivo. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Selecciona o crea un perfil para comenzar.
            </span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 mb-12 max-w-6xl">
          {profiles.map(p => (
            <div key={p.id} className="relative group">
              <ProfileCard profile={p} onClick={() => handleSelectProfile(p.id)} />
              <button
                onClick={(e) => handleDeleteProfile(e, p.id)}
                className={`absolute -top-3 -right-3 p-2 border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-red-400' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {!showCreateProfile && (
            <button
              onClick={() => setShowCreateProfile(true)}
              className={`relative flex flex-col items-center justify-center p-10 border-4 border-dashed rounded-[2.5rem] transition-all w-full max-w-xs aspect-square group overflow-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500 hover:bg-slate-700/70'
                  : 'bg-white/50 border-slate-200 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50'
              } backdrop-blur-sm`}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-500 group-hover:bg-gradient-to-br group-hover:from-indigo-900 group-hover:to-purple-900 group-hover:text-indigo-400'
                  : 'bg-slate-100 text-slate-300 group-hover:bg-gradient-to-br group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-500'
              }`}>
                <Plus size={56} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </div>
              <h3 className={`relative text-xl font-black transition-colors ${
                theme === 'dark'
                  ? 'text-slate-500 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text'
                  : 'text-slate-400 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text'
              }`}>
                Nuevo Perfil
              </h3>
            </button>
          )}

          {showCreateProfile && (
            <div className={`p-10 rounded-[3rem] shadow-2xl border w-full max-w-lg animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <h2 className="text-3xl font-black mb-8 tracking-tight">Crear Perfil</h2>
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Nombre Perfil</label>
                    <input type="text" required value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-none' : 'bg-slate-50 border-none'}`} placeholder="Ej: Universidad" />
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Tu Nombre</label>
                    <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-none' : 'bg-slate-50 border-none'}`} placeholder="Ej: Maria" />
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
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Genero</label>
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
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VISTA PRINCIPAL (PERFIL ACTIVO)
  // ============================================================================

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <ModernLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userEmail={user?.email}
        userPlan={userProfile?.plan}
      >
        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'subjects' && <SubjectsManager />}
          {activeTab === 'exams' && <ExamManager />}
          {activeTab === 'tasks' && <EnhancedTaskProgress />}
          {activeTab === 'materials' && <MaterialManager />}
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'statistics' && <StatisticsView />}
          {activeTab === 'notes' && <BlockEditor />}
          {activeTab === 'graph' && <KnowledgeGraph />}
          {activeTab === 'journal' && <FocusJournal />}
          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </ModernLayout>

      {/* Pantalla de Bienvenida */}
      {showWelcomeScreen && activeProfile && (
        <WelcomeScreen
          profile={activeProfile}
          onDismiss={() => setShowWelcomeScreen(false)}
        />
      )}

      {/* Pantalla de desbloqueo con PIN */}
      {pendingProfile && (
        <ProfileUnlock
          profile={pendingProfile}
          onUnlock={handleUnlockSuccess}
          onCancel={handleUnlockCancel}
          theme={theme}
        />
      )}
    </div>
  );
};

// ============================================================================
// APP WRAPPER CON AUTH PROVIDER
// ============================================================================

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
