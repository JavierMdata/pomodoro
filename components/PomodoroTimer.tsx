
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { soundService } from '../lib/soundService';
import DropdownTaskSelector from './DropdownTaskSelector';
import {
  Play, Pause, RotateCcw, Star,
  Maximize2, Minimize2, Sparkles, Trophy, BrainCircuit, Loader2,
  Info, AlertTriangle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const PomodoroTimer: React.FC = () => {
  const {
    theme, activeProfileId, profiles, settings, tasks,
    subjects, examTopics, materials, exams, addSession,
    activeTimer, startActiveTimer, pauseActiveTimer, resumeActiveTimer, stopActiveTimer, getElapsedSeconds
  } = useAppStore();

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const currentSettings = activeProfileId ? settings[activeProfileId] : null;

  // Filtrar tareas, materiales y temas por perfil activo
  const filteredTasks = useMemo(() => {
    if (!activeProfileId) return [];
    return tasks.filter(t => {
      const taskSubject = subjects.find(s => s.id === t.subject_id);
      return taskSubject?.profile_id === activeProfileId;
    });
  }, [tasks, subjects, activeProfileId]);

  const filteredMaterials = useMemo(() => {
    if (!activeProfileId) return [];
    return materials.filter(m => {
      const materialSubject = subjects.find(s => s.id === m.subject_id);
      return materialSubject?.profile_id === activeProfileId;
    });
  }, [materials, subjects, activeProfileId]);

  const filteredExamTopics = useMemo(() => {
    if (!activeProfileId) return [];
    return examTopics.filter(et => {
      const exam = exams.find(e => e.id === et.exam_id);
      if (!exam) return false;
      const examSubject = subjects.find(s => s.id === exam.subject_id);
      return examSubject?.profile_id === activeProfileId;
    });
  }, [examTopics, exams, subjects, activeProfileId]);

  // Estados derivados del timer persistente
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>(() => {
    return activeTimer?.mode || 'work';
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    if (activeTimer && !activeTimer.is_paused) {
      const elapsed = Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000);
      return Math.max(0, activeTimer.duration_seconds - elapsed);
    } else if (activeTimer?.is_paused) {
      const elapsed = activeTimer.elapsed_when_paused || 0;
      return Math.max(0, activeTimer.duration_seconds - elapsed);
    }
    const initialDuration = currentSettings?.work_duration || 25;
    return initialDuration * 60;
  });
  const [isActive, setIsActive] = useState(() => {
    return activeTimer !== null && !activeTimer.is_paused;
  });
  const [isPaused, setIsPaused] = useState(() => {
    return activeTimer?.is_paused || false;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'exam' | 'task' | 'material';
    subject: any;
    item: any;
    meta?: any;
    displayTitle: string;
  } | null>(() => {
    // Restaurar item seleccionado del timer activo
    if (activeTimer?.selected_item_type) {
      return {
        type: activeTimer.selected_item_type,
        subject: { id: activeTimer.selected_subject_id },
        item: { id: activeTimer.selected_item_id },
        meta: activeTimer.selected_meta_id ? { id: activeTimer.selected_meta_id } : undefined,
        displayTitle: activeTimer.selected_display_title || ''
      };
    }
    return null;
  });
  const [sessionCount, setSessionCount] = useState(() => activeTimer?.session_count || 1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [timerRestored, setTimerRestored] = useState(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<string | null>(activeTimer?.started_at || null);

  // Efecto para restaurar timer al cargar la página
  useEffect(() => {
    if (activeTimer && !timerRestored) {
      setTimerRestored(true);
      setMode(activeTimer.mode);
      setSessionCount(activeTimer.session_count);

      if (!activeTimer.is_paused) {
        setIsActive(true);
        setIsPaused(false);
        // Calcular tiempo restante
        const elapsed = Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000);
        const remaining = Math.max(0, activeTimer.duration_seconds - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Timer expiró mientras la app estaba cerrada
          handleComplete();
        }
      } else {
        setIsActive(false);
        setIsPaused(true);
        const elapsed = activeTimer.elapsed_when_paused || 0;
        setTimeLeft(Math.max(0, activeTimer.duration_seconds - elapsed));
      }

      // Restaurar item seleccionado
      if (activeTimer.selected_item_type) {
        setSelectedItem({
          type: activeTimer.selected_item_type,
          subject: { id: activeTimer.selected_subject_id },
          item: { id: activeTimer.selected_item_id },
          meta: activeTimer.selected_meta_id ? { id: activeTimer.selected_meta_id } : undefined,
          displayTitle: activeTimer.selected_display_title || ''
        });
      }

      console.log('🔄 Timer restaurado:', {
        mode: activeTimer.mode,
        isPaused: activeTimer.is_paused,
        timeLeft: activeTimer.duration_seconds - (activeTimer.elapsed_when_paused || 0)
      });
    }
  }, [activeTimer]);

  // Solicitar permiso para notificaciones al montar el componente
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Función para mostrar notificación del sistema
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'pomodoro-timer',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const getMotivationalPhrase = () => {
    const noun = activeProfile?.gender === 'femenino' ? 'reina' : activeProfile?.gender === 'masculino' ? 'rey' : 'estudiante';
    const phrases = [
      `¡Deja el móvil, ${noun}! 👑`,
      `¡Tu futuro te lo agradecerá! 💪`,
      `¡Enfoque láser, ${activeProfile?.user_name}! 🚀`,
      "¡Casi llegamos a la meta! 🌟",
      "¡Demuestra de lo que eres capaz! ✨"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const getAiSuggestion = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setAiTip("Configura tu API_KEY para activar la IA.");
      setTimeout(() => setAiTip(null), 5000);
      return;
    }

    setIsSuggesting(true);
    try {
      const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
      const ai = new GoogleGenAI({ apiKey });
      // Fix: Properly close the template literal interpolation after JSON.stringify.
      const prompt = `Tengo estas tareas: ${JSON.stringify(pendingTasks.map(t => ({ title: t.title, priority: t.priority })))}. Small tip (max 8 words) on what to focus on based on priority. Tone: Encouraging mentor. Language: Spanish.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiTip(response.text || "Prioriza lo más urgente hoy.");
      setTimeout(() => setAiTip(null), 8000);
    } catch (error) {
      console.error(error);
      setAiTip("Error al conectar con la IA.");
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    if (isActive && mode === 'work') {
      const interval = setInterval(() => {
        setMotivation(getMotivationalPhrase());
        setTimeout(() => setMotivation(null), 5000);
      }, 90000); 
      return () => clearInterval(interval);
    }
  }, [isActive, mode]);

  useEffect(() => {
    // No resetear si hay un timer activo (evita sobrescribir el tiempo restaurado)
    if (activeTimer) return;

    if (currentSettings && !isActive && !isPaused) {
      const mins = mode === 'work' ? currentSettings.work_duration : mode === 'short_break' ? currentSettings.short_break : currentSettings.long_break;
      setTimeLeft(mins * 60);
    }
  }, [mode, currentSettings, activeTimer, isActive, isPaused]);

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

  // Handler para cuando se selecciona un item del selector jerárquico
  const handleItemSelection = (selection: any) => {
    const displayTitle = selection.meta
      ? `${selection.meta.title} (${selection.item.name || selection.item.title})`
      : selection.item.name || selection.item.title;

    setSelectedItem({
      ...selection,
      displayTitle
    });
  };

  const handleStart = async () => {
    if (mode === 'work' && !selectedItem) {
      soundService.playError();
      soundService.vibrate([100, 50, 100]);
      setAiTip("Elige un tema antes de arrancar.");
      setTimeout(() => setAiTip(null), 3000);
      return;
    }

    // Reproducir sonido de inicio
    soundService.playStart();
    soundService.vibrate([50, 100, 50]);

    const now = new Date().toISOString();
    startTimeRef.current = now;

    // Si está pausado, reanudar
    if (isPaused && activeTimer) {
      await resumeActiveTimer();
      setIsPaused(false);
      setIsActive(true);
      return;
    }

    // Iniciar nuevo timer
    const durationMins = mode === 'work'
      ? currentSettings?.work_duration || 25
      : mode === 'short_break'
        ? currentSettings?.short_break || 5
        : currentSettings?.long_break || 15;

    await startActiveTimer({
      profile_id: activeProfileId!,
      mode,
      started_at: now,
      duration_seconds: durationMins * 60,
      is_paused: false,
      session_count: sessionCount,
      selected_item_type: selectedItem?.type,
      selected_item_id: selectedItem?.item?.id,
      selected_meta_id: selectedItem?.meta?.id,
      selected_subject_id: selectedItem?.subject?.id,
      selected_display_title: selectedItem?.displayTitle
    });

    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = async () => {
    soundService.playPause();
    soundService.vibrate(25);
    await pauseActiveTimer();
    setIsActive(false);
    setIsPaused(true);
  };

  const handleReset = async () => {
    soundService.playWhoosh();
    soundService.vibrate(30);
    await stopActiveTimer();
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft((mode === 'work' ? currentSettings?.work_duration || 25 : 5) * 60);
    startTimeRef.current = null;
  };

  const handleComplete = async () => {
    setIsActive(false);
    setIsPaused(false);

    // Reproducir sonido de finalización
    soundService.playComplete();
    soundService.vibrate([200, 100, 200, 100, 200]);

    // Mostrar notificación del sistema
    if (mode === 'work') {
      showNotification(
        '¡Pomodoro Completado! 🎉',
        `Has terminado tu sesión de ${selectedItem?.displayTitle || 'trabajo'}. ¡Tiempo de descansar!`
      );
      setShowCompletionModal(true);
    } else {
      showNotification(
        '¡Descanso Terminado! ⚡',
        '¡Es hora de volver al trabajo con energía renovada!'
      );
      // Limpiar timer activo antes de cambiar de modo
      await stopActiveTimer();
      setMode('work');
    }
  };

  const saveSession = async () => {
    if (!activeProfileId || !startTimeRef.current) return;

    soundService.playSuccess();
    soundService.vibrate([100, 50, 100]);

    const plannedMins = mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short_break' ? currentSettings?.short_break || 5 : 15;
    const actualSecs = (plannedMins * 60) - timeLeft;

    addSession({
      profile_id: activeProfileId,
      task_id: selectedItem?.type === 'task' ? selectedItem.item.id : undefined,
      exam_topic_id: selectedItem?.type === 'exam' && selectedItem.meta ? selectedItem.meta.id : undefined,
      material_id: selectedItem?.type === 'material' ? selectedItem.item.id : undefined,
      session_type: mode,
      planned_duration_minutes: plannedMins,
      duration_seconds: actualSecs,
      status: 'completed',
      focus_rating: rating,
      started_at: startTimeRef.current,
      completed_at: new Date().toISOString(),
    });

    // Limpiar timer activo
    await stopActiveTimer();

    setShowCompletionModal(false);
    setRating(0);
    startTimeRef.current = null;

    const newSessionCount = sessionCount + 1;

    if (mode === 'work') {
      const nextMode = sessionCount % (currentSettings?.poms_before_long || 4) === 0 ? 'long_break' : 'short_break';
      setMode(nextMode);
      setSessionCount(newSessionCount);

      // Iniciar automáticamente el descanso
      const breakDuration = nextMode === 'long_break'
        ? currentSettings?.long_break || 15
        : currentSettings?.short_break || 5;
      setTimeLeft(breakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft((currentSettings?.work_duration || 25) * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center py-10 transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-950 justify-center p-12' : 'max-w-xl mx-auto'}`}>
      
      {motivation && (
        <div className="fixed top-24 animate-bounce bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl z-[110] font-black border-4 border-white/20 text-xl">
          <Sparkles className="inline mr-2" /> {motivation}
        </div>
      )}

      {aiTip && (
        <div className={`fixed bottom-10 animate-in slide-in-from-bottom duration-500 px-8 py-4 rounded-3xl border shadow-2xl z-[120] font-black flex items-center gap-3 ${theme === 'dark' ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-white border-indigo-100 text-indigo-700'}`}>
          <BrainCircuit className="text-indigo-500" />
          {aiTip}
        </div>
      )}

      {isFullscreen && (
        <button onClick={() => setIsFullscreen(false)} className="absolute top-12 right-12 text-white/30 hover:text-white flex items-center gap-3 transition-colors">
          <Minimize2 size={32} /> <span className="text-sm font-black uppercase tracking-[0.3em]">Cerrar Foco</span>
        </button>
      )}

      {!isFullscreen && (
        <div className={`flex gap-3 mb-16 p-2 rounded-[2rem] border-2 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          {(['work', 'short_break', 'long_break'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setIsActive(false); }}
              className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow-xl scale-105' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {m === 'work' ? 'Productividad' : m === 'short_break' ? 'D. Corto' : 'D. Largo'}
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-20 group">
        {/* Enhanced glow effects */}
        <div className={`absolute -inset-12 rounded-full blur-3xl transition-all duration-1000 ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-100 animate-pulse'
            : 'bg-indigo-500/10 opacity-0 group-hover:opacity-100'
        }`} />

        {/* Multiple layered glows */}
        {isActive && (
          <>
            <div className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}

        <svg className={`${isFullscreen ? 'w-[38rem] h-[38rem]' : 'w-96 h-96'} -rotate-90 transition-all duration-1000 relative z-10 drop-shadow-2xl`}>
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' || isFullscreen ? "#1e293b" : "#f1f5f9"} />
              <stop offset="100%" stopColor={theme === 'dark' || isFullscreen ? "#0f172a" : "#e2e8f0"} />
            </linearGradient>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          <circle cx="50%" cy="50%" r="45%" stroke="url(#bgGradient)" strokeWidth="6" fill="transparent" />

          {/* Progress circle with gradient */}
          <circle
            cx="50%" cy="50%" r="45%"
            stroke="url(#progressGradient)" strokeWidth="12" fill="transparent"
            className="transition-all duration-300 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]"
            strokeDasharray="283%"
            strokeDashoffset={`${283 - (timeLeft / ((mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short_break' ? 5 : 15) * 60)) * 283}%`}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))'
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="relative">
            <span className={`${isFullscreen ? 'text-[14rem]' : 'text-9xl'} font-black tracking-tighter leading-none bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent ${
              isActive ? 'animate-pulse' : ''
            }`} style={isFullscreen ? { WebkitTextStroke: '2px rgba(99, 102, 241, 0.1)' } : {}}>
              {formatTime(timeLeft)}
            </span>
            {/* Time glow effect */}
            {isActive && (
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
            )}
          </div>

          {selectedItem && (
            <div className="mt-12 text-center px-10 animate-in fade-in duration-500 relative">
              <div className="relative inline-block">
                <p className="text-[12px] font-black uppercase tracking-[0.4em] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                  Meta de Enfoque
                </p>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              </div>
              <p className={`text-2xl font-black truncate max-w-[320px] mt-3 ${theme === 'dark' || isFullscreen ? 'text-slate-200' : 'text-slate-900'}`}>
                {selectedItem.displayTitle}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8 md:gap-16 relative z-30">
        <button
          onClick={handleReset}
          className={`relative p-6 md:p-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90 group touch-manipulation ${
            theme === 'dark' || isFullscreen
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
        </button>

        <button
          onClick={isActive ? handlePause : handleStart}
          className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 group overflow-hidden touch-manipulation ${
            isActive
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/50'
              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-indigo-500/50'
          }`}
        >
          {/* Animated background on hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
            isActive
              ? 'bg-gradient-to-tr from-orange-600 to-amber-500'
              : 'bg-gradient-to-tr from-purple-700 to-indigo-600'
          }`} />

          {/* Glow effect */}
          <div className={`absolute -inset-2 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity ${
            isActive ? 'bg-amber-500' : 'bg-indigo-500'
          }`} />

          {/* Icon */}
          <div className="relative z-10">
            {isActive ? (
              <Pause size={80} fill="currentColor" className="drop-shadow-2xl" />
            ) : (
              <Play size={80} fill="currentColor" className="ml-4 drop-shadow-2xl" />
            )}
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer opacity-30" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`relative p-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90 group ${
            theme === 'dark' || isFullscreen
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          {isFullscreen ? <Minimize2 size={32} /> : <Maximize2 size={32} />}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
        </button>
      </div>

      {!isActive && !isPaused && !isFullscreen && activeProfileId && (
        <div className="mt-16 w-full max-w-4xl mx-auto">
          {/* Header con botón IA */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className={`text-xs font-black uppercase tracking-[0.3em] ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
            }`}>
              ¿Qué vamos a lograr hoy?
            </h3>
            <button
              onClick={getAiSuggestion}
              disabled={isSuggesting}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 disabled:opacity-50 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-500/10"
            >
              {isSuggesting ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
              Asesor IA
            </button>
          </div>

          {/* Selector Desplegable */}
          <DropdownTaskSelector
            theme={theme}
            onSelect={handleItemSelection}
            activeProfileId={activeProfileId}
          />
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-8 z-[300]">
          <div className={`w-full max-w-xl rounded-[4rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in duration-500 ${theme === 'dark' ? 'bg-slate-900 border border-white/5' : 'bg-white'}`}>
            <div className="w-32 h-32 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
              <Trophy size={64} />
            </div>
            <h2 className={`text-5xl font-black text-center mb-4 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>¡Misión Cumplida!</h2>
            <p className="text-center text-slate-500 font-bold mb-12 text-lg">Tu cerebro te agradece el enfoque. ¿Cómo fue la calidad?</p>
            <div className="flex justify-center gap-4 mb-16">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`transition-all hover:scale-125 ${rating >= s ? 'text-yellow-400' : 'text-slate-200'}`}>
                  <Star size={54} fill={rating >= s ? "currentColor" : "none"} strokeWidth={3} />
                </button>
              ))}
            </div>
            <button onClick={saveSession} className="w-full bg-indigo-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-[0.2em] text-lg active:scale-95">
              Registrar Esfuerzo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
