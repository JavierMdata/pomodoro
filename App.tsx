
import React, { useState, useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
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
import { Plus, GraduationCap, Briefcase, Trash2, ArrowRight, CheckCircle2, Moon, Sun, Save } from 'lucide-react';
import { ProfileType, Gender, PomodoroSettings } from './types';

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

  // Cargar datos de Supabase al iniciar
  useEffect(() => {
    syncWithSupabase();
  }, []);

  useEffect(() => {
    if (activeProfileId && settings[activeProfileId]) {
      setLocalSettings(settings[activeProfileId]);
    }
  }, [activeProfileId, settings]);

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

  // Profile Selector View
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

        <div className="relative text-center mb-20 max-w-3xl animate-in fade-in slide-in-from-bottom duration-700">
          <div className="relative inline-block mb-8">
            <h1 className="text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PomoSmart
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50" />
          </div>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-2xl font-bold leading-relaxed`}>
            Tu centro de comando académico definitivo. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Organiza, enfoca y domina tu semestre.
            </span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 mb-12 max-w-6xl">
          {profiles.map(p => (
            <div key={p.id} className="relative group">
                <ProfileCard profile={p} onClick={() => setActiveProfile(p.id)} />
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
          )}
        </div>
      </div>
    );
  }

  // Active Profile Main View
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <ModernLayout activeTab={activeTab} setActiveTab={setActiveTab}>
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
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto py-10">
              <h1 className={`text-4xl font-black mb-10 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Preferencias del Perfil</h1>
              <div className={`p-10 rounded-[3rem] border shadow-sm space-y-12 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <section>
                  <h3 className={`text-2xl font-black mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      <div className="w-2.5 h-10 bg-indigo-500 rounded-full" />
                      Tiempos del Pomodoro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tiempo de Trabajo (minutos)</label>
                      <input 
                        type="number" 
                        value={localSettings?.work_duration || 25} 
                        onChange={(e) => setLocalSettings(prev => prev ? { ...prev, work_duration: parseInt(e.target.value) || 0 } : null)}
                        className={`w-full p-5 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/20 font-bold text-lg transition-all ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100'}`} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descanso Corto (minutos)</label>
                      <input 
                        type="number" 
                        value={localSettings?.short_break || 5} 
                        onChange={(e) => setLocalSettings(prev => prev ? { ...prev, short_break: parseInt(e.target.value) || 0 } : null)}
                        className={`w-full p-5 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/20 font-bold text-lg transition-all ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100'}`} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descanso Largo (minutos)</label>
                      <input 
                        type="number" 
                        value={localSettings?.long_break || 15} 
                        onChange={(e) => setLocalSettings(prev => prev ? { ...prev, long_break: parseInt(e.target.value) || 0 } : null)}
                        className={`w-full p-5 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/20 font-bold text-lg transition-all ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100'}`} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pomodoros hasta Descanso Largo</label>
                      <input 
                        type="number" 
                        value={localSettings?.poms_before_long || 4} 
                        onChange={(e) => setLocalSettings(prev => prev ? { ...prev, poms_before_long: parseInt(e.target.value) || 0 } : null)}
                        className={`w-full p-5 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/20 font-bold text-lg transition-all ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100'}`} 
                      />
                    </div>
                  </div>
                </section>

                <section>
                   <h3 className={`text-2xl font-black mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      <div className="w-2.5 h-10 bg-indigo-500 rounded-full" />
                      Automatización
                  </h3>
                  <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-700/50 rounded-3xl border border-slate-100 dark:border-slate-600">
                    <div>
                      <h4 className="font-bold">Auto-iniciar descansos</h4>
                      <p className="text-xs text-slate-400 font-medium">Comienza el descanso automáticamente al terminar el trabajo.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={localSettings?.auto_start_breaks || false}
                      onChange={(e) => setLocalSettings(prev => prev ? { ...prev, auto_start_breaks: e.target.checked } : null)}
                      className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </section>

                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  Guardar Preferencias <Save size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </ModernLayout>
    </div>
  );
};

export default App;
