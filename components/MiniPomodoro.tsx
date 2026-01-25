import React, { useState, useEffect } from 'react';
import { Flame, Play, Pause, RotateCcw, X } from 'lucide-react';

interface MiniPomodoroProps {
  duration?: number; // en minutos
  onComplete?: () => void;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

const MiniPomodoro: React.FC<MiniPomodoroProps> = ({
  duration = 25,
  onComplete,
  theme = 'light',
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`group relative p-3 rounded-2xl transition-all hover:scale-110 ${
          theme === 'dark'
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : 'bg-red-50 text-red-600 hover:bg-red-100'
        }`}
        title="Pomodoro rápido"
      >
        <Flame size={20} className={isRunning ? 'animate-pulse' : ''} />
        {isRunning && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl border-2 shadow-lg md:shadow-xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      } ${compact ? 'p-3 md:p-4' : 'p-4 md:p-5 lg:p-6'}`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />

      {/* Progress circle background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-red-500"
            strokeDasharray={`${progress * 2.83} 283`}
          />
        </svg>
      </div>

      <div className="relative z-10">
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-0 right-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        )}

        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <Flame className="text-red-500 animate-pulse w-5 h-5 md:w-6 md:h-6" />
          <h3 className={`font-black uppercase tracking-wider md:tracking-widest text-xs md:text-sm ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Pomodoro
          </h3>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4 md:mb-6">
          <div className={`text-4xl sm:text-5xl font-black tabular-nums ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest mt-1.5 md:mt-2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {isRunning ? 'En progreso' : timeLeft === 0 ? '¡Completado!' : 'Listo para empezar'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-1.5 md:h-2 rounded-full overflow-hidden mb-4 md:mb-6 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          <div
            className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full shimmer opacity-30" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 md:gap-3 justify-center">
          <button
            onClick={handleToggle}
            className={`px-4 md:px-5 lg:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all flex items-center gap-1.5 md:gap-2 shadow-lg text-sm md:text-base ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">{timeLeft === duration * 60 ? 'Iniciar' : 'Continuar'}</span>
              </>
            )}
          </button>

          {timeLeft !== duration * 60 && (
            <button
              onClick={handleReset}
              className={`px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniPomodoro;
