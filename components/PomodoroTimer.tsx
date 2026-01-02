
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { 
  Play, Pause, Square, RotateCcw, CheckCircle2, Star, 
  Maximize2, Minimize2, ChevronDown, Sparkles 
} from 'lucide-react';

const PomodoroTimer: React.FC = () => {
  const { 
    theme, activeProfileId, profiles, settings, tasks, 
    subjects, exams, examTopics, materials, addSession 
  } = useAppStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const currentSettings = activeProfileId ? settings[activeProfileId] : null;
  
  const activeTasks = tasks.filter(t => {
    const subject = subjects.find(s => s.id === t.subject_id);
    return subject?.profile_id === activeProfileId && t.status !== 'completed';
  });
  const activeMaterials = materials.filter(m => m.profile_id === activeProfileId && m.status !== 'completed');
  
  const activeTopics = examTopics.filter(et => {
    const exam = exams.find(e => e.id === et.exam_id);
    const subject = subjects.find(s => s.id === exam?.subject_id);
    return subject?.profile_id === activeProfileId && et.status !== 'completed';
  });

  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string, type: 'task' | 'topic' | 'material', title: string, subtitle: string } | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [motivation, setMotivation] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  const motivationalPhrases = [
    "¡Nada de distracciones, {name}! 👑",
    "¡Concéntrate, mi {gender_noun}! 💪",
    "¡Tú puedes con esto, {name}! 🚀",
    "¡El éxito está cerca! 🌟",
    "¡Estás haciendo un gran trabajo! ✨"
  ];

  const getGenderNoun = () => activeProfile?.gender === 'femenino' ? 'reina' : 'rey';

  useEffect(() => {
    if (isActive && mode === 'work') {
      const interval = setInterval(() => {
        const phrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]
          .replace('{gender_noun}', getGenderNoun())
          .replace('{name}', activeProfile?.user_name || '');
        setMotivation(phrase);
        setTimeout(() => setMotivation(null), 4000);
      }, 45000); 
      return () => clearInterval(interval);
    }
  }, [isActive, mode]);

  useEffect(() => {
    if (currentSettings) {
      const mins = mode === 'work' ? currentSettings.work_duration : mode === 'short' ? currentSettings.short_break : currentSettings.long_break;
      setTimeLeft(mins * 60);
    }
  }, [mode, currentSettings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    if (mode === 'work' && !selectedItem) {
      alert('Primero selecciona qué vas a estudiar.');
      return;
    }
    setIsActive(true);
    if (!startTimeRef.current) startTimeRef.current = Date.now();
  };

  const handleComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
        setShowCompletionModal(true);
    } else {
        setMode('work');
        setTimeLeft((currentSettings?.work_duration || 25) * 60);
    }
  };

  const saveSession = () => {
    if (!activeProfileId) return;
    addSession({
      profile_id: activeProfileId,
      task_id: selectedItem?.type === 'task' ? selectedItem.id : undefined,
      exam_topic_id: selectedItem?.type === 'topic' ? selectedItem.id : undefined,
      material_id: selectedItem?.type === 'material' ? selectedItem.id : undefined,
      duration_seconds: (currentSettings?.work_duration || 25) * 60,
      focus_rating: rating,
      status: 'completed',
      started_at: new Date(startTimeRef.current!).toISOString(),
      completed_at: new Date().toISOString(),
    });
    setShowCompletionModal(false);
    setRating(0);
    startTimeRef.current = null;
    if (sessionCount % (currentSettings?.poms_before_long || 4) === 0) setMode('long');
    else setMode('short');
    setSessionCount(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const containerStyles = isFullscreen 
    ? "fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500"
    : "max-w-xl mx-auto flex flex-col items-center py-6";

  return (
    <div className={`${containerStyles} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {motivation && (
        <div className="fixed top-20 animate-in slide-in-from-top duration-700 bg-indigo-600 px-6 py-3 rounded-2xl border border-white/20 text-white font-bold flex items-center gap-3 z-[110] shadow-2xl">
          <Sparkles className="text-yellow-400" />
          {motivation}
        </div>
      )}

      {isFullscreen && (
        <div className="absolute top-10 left-10 flex items-center gap-4 text-white/40">
          <Minimize2 
            className="cursor-pointer hover:text-white transition-colors" 
            onClick={() => setIsFullscreen(false)} 
          />
          <span className="text-xs font-black tracking-widest uppercase">Modo Concentración</span>
        </div>
      )}

      {!isFullscreen && (
        <div className={`flex gap-2 mb-8 p-1 rounded-2xl border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {(['work', 'short', 'long'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setIsActive(false); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow-md' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {m === 'work' ? 'Pomodoro' : m === 'short' ? 'D. Corto' : 'D. Largo'}
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-12">
        <svg className={`${isFullscreen ? 'w-[32rem] h-[32rem]' : 'w-72 h-72'} -rotate-90 transition-all duration-700`}>
          <circle cx="50%" cy="50%" r="46%" stroke="currentColor" strokeWidth="4" fill="transparent" className={theme === 'dark' || isFullscreen ? "text-slate-800" : "text-slate-100"} />
          <circle 
            cx="50%" cy="50%" r="46%" 
            stroke="currentColor" strokeWidth="4" fill="transparent" 
            className="text-indigo-500 transition-all duration-1000"
            strokeDasharray="100%"
            strokeDashoffset={`${100 - (timeLeft / ((mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short' ? currentSettings?.short_break || 5 : currentSettings?.long_break || 15) * 60)) * 100}%`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${isFullscreen ? 'text-[12rem]' : 'text-7xl'} font-black tracking-tighter transition-all duration-700 leading-none`}>
            {formatTime(timeLeft)}
          </span>
          {selectedItem && (
            <div className="mt-8 text-center px-10">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-40`}>Sesión de estudio</p>
              <p className={`text-lg font-bold truncate max-w-[300px] text-indigo-400`}>{selectedItem.title}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-10 mb-12">
        <button onClick={() => { setTimeLeft((mode === 'work' ? currentSettings?.work_duration || 25 : 5) * 60); setIsActive(false); }} className={`p-5 rounded-full border transition-all ${theme === 'dark' || isFullscreen ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
          <RotateCcw size={24} />
        </button>
        <button 
          onClick={isActive ? () => setIsActive(false) : handleStart}
          className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-indigo-600'}`}
        >
          {isActive ? <Pause size={56} fill="currentColor" /> : <Play size={56} fill="currentColor" className="ml-2" />}
        </button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-5 rounded-full border transition-all ${theme === 'dark' || isFullscreen ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
          {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
      </div>

      {!isActive && !isFullscreen && (
        <div className={`w-full p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Selección de ítem</h3>
            <select 
              className={`w-full p-5 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(':');
                if (!id) { setSelectedItem(null); return; }
                let title = '', subtitle = '';
                if (type === 'task') {
                    const t = tasks.find(t => t.id === id);
                    title = t?.title || '';
                    subtitle = 'Tarea';
                } else if (type === 'material') {
                    const m = materials.find(m => m.id === id);
                    title = m?.title || '';
                    subtitle = 'Material';
                } else if (type === 'topic') {
                    const et = examTopics.find(et => et.id === id);
                    title = et?.title || '';
                    subtitle = 'Tema';
                }
                setSelectedItem({ type: type as any, id, title, subtitle });
              }}
            >
              <option value="">-- Elige qué trabajar hoy --</option>
              {activeTasks.length > 0 && (
                <optgroup label="Tareas Próximas">
                  {activeTasks.map(t => <option key={t.id} value={`task:${t.id}`}>{t.title}</option>)}
                </optgroup>
              )}
              {activeTopics.length > 0 && (
                <optgroup label="Temas de Examen">
                  {activeTopics.map(et => <option key={et.id} value={`topic:${et.id}`}>{et.title}</option>)}
                </optgroup>
              )}
              {activeMaterials.length > 0 && (
                <optgroup label="Material de Lectura">
                  {activeMaterials.map(m => <option key={m.id} value={`material:${m.id}`}>{m.title}</option>)}
                </optgroup>
              )}
            </select>
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className={`w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-3xl font-black text-center mb-2">¡Excelente Sesión!</h2>
            <p className="text-center text-slate-400 mb-10">Has completado el pomodoro. Califica tu nivel de enfoque:</p>
            <div className="flex justify-center gap-4 mb-12">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={48} className={`cursor-pointer transition-all ${rating >= s ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-slate-300'}`} onClick={() => setRating(s)} />
              ))}
            </div>
            <button onClick={saveSession} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm">
              Guardar Log y Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
