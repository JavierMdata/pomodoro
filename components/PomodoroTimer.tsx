
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
    activeTimer, startActiveTimer, pauseActiveTimer, resumeActiveTimer, stopActiveTimer, getElapsedSeconds,
    selectedSectionForPomodoro, clearSelectedSectionForPomodoro, categoryInstances
  } = useAppStore();

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const currentSettings = activeProfileId ? settings[activeProfileId] : null;

  // Filter tasks, materials and topics by active profile
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

  // Timer state derived from persistent timer
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
    type: 'exam' | 'task' | 'material' | 'section';
    subject: any;
    item: any;
    meta?: any;
    displayTitle: string;
  } | null>(() => {
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
  const endTimeRef = useRef<number | null>(null);

  // Restore timer on page load
  useEffect(() => {
    if (activeTimer && !timerRestored) {
      setTimerRestored(true);
      setMode(activeTimer.mode);
      setSessionCount(activeTimer.session_count);

      if (!activeTimer.is_paused) {
        setIsActive(true);
        setIsPaused(false);
        const elapsed = Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000);
        const remaining = Math.max(0, activeTimer.duration_seconds - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleComplete();
        }
      } else {
        setIsActive(false);
        setIsPaused(true);
        const elapsed = activeTimer.elapsed_when_paused || 0;
        setTimeLeft(Math.max(0, activeTimer.duration_seconds - elapsed));
      }

      if (activeTimer.selected_item_type) {
        setSelectedItem({
          type: activeTimer.selected_item_type,
          subject: { id: activeTimer.selected_subject_id },
          item: { id: activeTimer.selected_item_id },
          meta: activeTimer.selected_meta_id ? { id: activeTimer.selected_meta_id } : undefined,
          displayTitle: activeTimer.selected_display_title || ''
        });
      }
    }
  }, [activeTimer]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle section selected from sidebar
  useEffect(() => {
    if (selectedSectionForPomodoro) {
      const { id, type } = selectedSectionForPomodoro;

      if (type === 'subject') {
        const subject = subjects.find(s => s.id === id);
        if (subject) {
          setSelectedItem({
            type: 'section',
            subject: subject,
            item: subject,
            displayTitle: subject.name
          });
        }
      } else if (type === 'category') {
        const category = categoryInstances.find(ci => ci.id === id);
        if (category) {
          setSelectedItem({
            type: 'section',
            subject: category,
            item: category,
            displayTitle: category.name
          });
        }
      }

      clearSelectedSectionForPomodoro();
    }
  }, [selectedSectionForPomodoro, subjects, categoryInstances, clearSelectedSectionForPomodoro]);

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
    if (activeTimer) return;
    if (currentSettings && !isActive && !isPaused) {
      const mins = mode === 'work' ? currentSettings.work_duration : mode === 'short_break' ? currentSettings.short_break : currentSettings.long_break;
      setTimeLeft(mins * 60);
    }
  }, [mode, currentSettings, activeTimer, isActive, isPaused]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      const targetEnd = endTimeRef.current;

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((targetEnd - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
        }
      }, 500);
    } else if (timeLeft === 0 && isActive) {
      endTimeRef.current = null;
      handleComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft === 0]);

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
    // Allow starting without a selected item - it will be "Estudio General"
    soundService.playStart();
    soundService.vibrate([50, 100, 50]);

    const now = new Date().toISOString();
    startTimeRef.current = now;

    if (isPaused && activeTimer) {
      await resumeActiveTimer();
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsPaused(false);
      setIsActive(true);
      return;
    }

    const durationMins = mode === 'work'
      ? currentSettings?.work_duration || 25
      : mode === 'short_break'
        ? currentSettings?.short_break || 5
        : currentSettings?.long_break || 15;

    endTimeRef.current = Date.now() + durationMins * 60 * 1000;

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
    endTimeRef.current = null;
    await pauseActiveTimer();
    setIsActive(false);
    setIsPaused(true);
  };

  const handleReset = async () => {
    soundService.playWhoosh();
    soundService.vibrate(30);
    endTimeRef.current = null;
    await stopActiveTimer();
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft((mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short_break' ? currentSettings?.short_break || 5 : currentSettings?.long_break || 15) * 60);
    startTimeRef.current = null;
  };

  const handleComplete = async () => {
    endTimeRef.current = null;
    setIsActive(false);
    setIsPaused(false);

    soundService.playComplete();
    soundService.vibrate([200, 100, 200, 100, 200]);

    if (mode === 'work') {
      showNotification(
        '¡Pomodoro Completado! 🎉',
        `Has terminado tu sesión de ${selectedItem?.displayTitle || 'estudio'}. ¡Tiempo de descansar!`
      );
      setShowCompletionModal(true);
    } else {
      showNotification(
        '¡Descanso Terminado! ⚡',
        '¡Es hora de volver al trabajo con energía renovada!'
      );
      await stopActiveTimer();
      setMode('work');
    }
  };

  const saveSession = async () => {
    if (!activeProfileId || !startTimeRef.current) return;

    soundService.playSuccess();
    soundService.vibrate([100, 50, 100]);

    const plannedMins = mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short_break' ? currentSettings?.short_break || 5 : currentSettings?.long_break || 15;
    const actualSecs = timeLeft === 0 ? plannedMins * 60 : (plannedMins * 60) - timeLeft;

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

    await stopActiveTimer();

    setShowCompletionModal(false);
    setRating(0);
    startTimeRef.current = null;

    const newSessionCount = sessionCount + 1;

    if (mode === 'work') {
      const nextMode = sessionCount % (currentSettings?.poms_before_long || 4) === 0 ? 'long_break' : 'short_break';
      setMode(nextMode);
      setSessionCount(newSessionCount);

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

  const totalDuration = (mode === 'work' ? currentSettings?.work_duration || 25 : mode === 'short_break' ? currentSettings?.short_break || 5 : currentSettings?.long_break || 15) * 60;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) : 0;

  const modeConfig = {
    work: { label: 'Productividad', color: 'indigo', gradient: 'from-indigo-600 via-purple-600 to-indigo-700' },
    short_break: { label: 'Descanso Corto', color: 'emerald', gradient: 'from-emerald-600 via-teal-600 to-emerald-700' },
    long_break: { label: 'Descanso Largo', color: 'amber', gradient: 'from-amber-600 via-orange-600 to-amber-700' }
  };

  const currentMode = modeConfig[mode];

  return (
    <div className={`flex flex-col items-center py-6 sm:py-8 md:py-10 transition-all duration-700 px-4 ${
      isFullscreen ? 'fixed inset-0 z-[100] bg-slate-950 justify-center p-4 sm:p-8' : 'max-w-xl mx-auto'
    }`}>

      {motivation && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-auto animate-bounce bg-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-2xl z-[110] font-black border-2 border-white/20 text-sm sm:text-base text-center">
          <Sparkles className="inline mr-2 w-4 h-4" /> {motivation}
        </div>
      )}

      {aiTip && (
        <div className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:max-w-md animate-in slide-in-from-bottom duration-500 px-5 py-3 rounded-2xl border shadow-2xl z-[120] font-bold text-sm flex items-center gap-2 ${
          theme === 'dark' ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-white border-indigo-100 text-indigo-700'
        }`}>
          <BrainCircuit className="text-indigo-500 flex-shrink-0" size={18} />
          <span className="line-clamp-2">{aiTip}</span>
        </div>
      )}

      {isFullscreen && (
        <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/30 hover:text-white flex items-center gap-2 transition-colors">
          <Minimize2 size={24} /> <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Cerrar</span>
        </button>
      )}

      {/* Mode Tabs */}
      {!isFullscreen && (
        <div className={`flex gap-1 mb-8 sm:mb-12 p-1 rounded-xl border ${
          theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          {(['work', 'short_break', 'long_break'] as const).map(m => (
            <button
              key={m}
              onClick={() => { if (!isActive) { setMode(m); } }}
              className={`px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                mode === m
                  ? `bg-gradient-to-r ${modeConfig[m].gradient} text-white shadow-md`
                  : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white'
              } ${isActive ? 'cursor-default' : ''}`}
            >
              {modeConfig[m].label}
            </button>
          ))}
        </div>
      )}

      {/* Timer Circle */}
      <div className="relative mb-10 sm:mb-14">
        {/* Glow effects */}
        {isActive && (
          <div className={`absolute -inset-6 sm:-inset-8 rounded-full blur-2xl opacity-30 animate-pulse bg-gradient-to-r ${currentMode.gradient}`} />
        )}

        <svg className={`${isFullscreen ? 'w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem]' : 'w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80'} -rotate-90 transition-all duration-500 relative z-10`}>
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' || isFullscreen ? "#1e293b" : "#f1f5f9"} />
              <stop offset="100%" stopColor={theme === 'dark' || isFullscreen ? "#0f172a" : "#e2e8f0"} />
            </linearGradient>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              {mode === 'work' ? (
                <>
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </>
              ) : mode === 'short_break' ? (
                <>
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </>
              )}
            </linearGradient>
          </defs>

          <circle cx="50%" cy="50%" r="45%" stroke="url(#bgGrad)" strokeWidth="6" fill="transparent" />

          <circle
            cx="50%" cy="50%" r="45%"
            stroke="url(#progressGrad)" strokeWidth="10" fill="transparent"
            className="transition-all duration-300"
            strokeDasharray="283%"
            strokeDashoffset={`${283 - progress * 283}%`}
            strokeLinecap="round"
            style={{
              filter: isActive ? 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.5))' : 'none'
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className={`${isFullscreen ? 'text-6xl sm:text-8xl md:text-9xl' : 'text-5xl sm:text-7xl md:text-8xl'} font-black tracking-tighter leading-none ${
            theme === 'dark' || isFullscreen ? 'text-white' : 'text-slate-900'
          } ${isActive ? 'animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>

          {selectedItem && (
            <div className="mt-3 sm:mt-4 text-center px-4 max-w-[200px] sm:max-w-[280px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
                Enfoque
              </p>
              <p className={`text-xs sm:text-sm font-black truncate ${
                theme === 'dark' || isFullscreen ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {selectedItem.displayTitle}
              </p>
            </div>
          )}

          {!selectedItem && !isActive && mode === 'work' && (
            <div className="mt-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Listo para empezar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session counter */}
      {!isFullscreen && (
        <div className={`mb-6 text-center text-[10px] font-bold uppercase tracking-widest ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Sesión #{sessionCount} {isPaused && '• En Pausa'}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8 relative z-30">
        <button
          onClick={handleReset}
          className={`relative p-4 sm:p-5 rounded-full border-2 transition-all hover:scale-110 active:scale-90 touch-manipulation ${
            theme === 'dark' || isFullscreen
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
          }`}
        >
          <RotateCcw size={22} className="sm:w-7 sm:h-7" />
        </button>

        <button
          onClick={isActive ? handlePause : handleStart}
          className={`relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 touch-manipulation ${
            isActive
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/40'
              : `bg-gradient-to-br ${currentMode.gradient} shadow-indigo-500/40`
          }`}
        >
          <div className={`absolute -inset-1 rounded-full blur-lg opacity-40 ${
            isActive ? 'bg-amber-500' : 'bg-indigo-500'
          }`} />
          <div className="relative z-10">
            {isActive ? (
              <Pause size={36} fill="currentColor" className="sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-lg" />
            ) : (
              <Play size={36} fill="currentColor" className="ml-1 sm:ml-2 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-lg" />
            )}
          </div>
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`relative p-4 sm:p-5 rounded-full border-2 transition-all hover:scale-110 active:scale-90 touch-manipulation ${
            theme === 'dark' || isFullscreen
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
          }`}
        >
          {isFullscreen ? <Minimize2 size={22} className="sm:w-7 sm:h-7" /> : <Maximize2 size={22} className="sm:w-7 sm:h-7" />}
        </button>
      </div>

      {/* Task Selector - only show when not active and not in fullscreen */}
      {!isActive && !isPaused && !isFullscreen && activeProfileId && (
        <div className="mt-8 sm:mt-12 w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className={`text-[11px] font-black uppercase tracking-widest ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
            }`}>
              ¿Qué vamos a lograr hoy?
            </h3>
            <button
              onClick={getAiSuggestion}
              disabled={isSuggesting}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 disabled:opacity-50 transition-colors px-2 py-1.5 rounded-lg hover:bg-indigo-500/10"
            >
              {isSuggesting ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
              <span className="hidden sm:inline">Asesor IA</span>
            </button>
          </div>

          <DropdownTaskSelector
            theme={theme}
            onSelect={handleItemSelection}
            activeProfileId={activeProfileId}
          />

          {/* Quick start info */}
          {!selectedItem && (
            <p className={`text-center text-[11px] mt-3 font-medium ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Puedes iniciar sin seleccionar nada para estudio general
            </p>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 z-[300]">
          <div className={`w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl animate-in zoom-in duration-500 ${
            theme === 'dark' ? 'bg-slate-900 border border-white/5' : 'bg-white'
          }`}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy size={40} className="sm:w-12 sm:h-12" />
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black text-center mb-2 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}>
              ¡Misión Cumplida!
            </h2>
            <p className="text-center text-slate-500 font-bold mb-8 text-sm">
              Tu cerebro te agradece el enfoque. ¿Cómo fue la calidad?
            </p>
            <div className="flex justify-center gap-2 sm:gap-3 mb-8">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`transition-all hover:scale-125 active:scale-90 ${rating >= s ? 'text-yellow-400' : 'text-slate-300'}`}>
                  <Star size={36} className="sm:w-10 sm:h-10" fill={rating >= s ? "currentColor" : "none"} strokeWidth={2.5} />
                </button>
              ))}
            </div>
            <button onClick={saveSession} className={`w-full bg-gradient-to-r ${currentMode.gradient} text-white font-black py-4 sm:py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-wider text-sm active:scale-95`}>
              Registrar Esfuerzo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
