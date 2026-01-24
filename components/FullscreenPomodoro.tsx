import React, { useState, useEffect, useRef } from 'react';
import { X, Pause, Play, RotateCcw, Sparkles, Flame, Star } from 'lucide-react';

interface FullscreenPomodoroProps {
  item: {
    title: string;
    color?: string;
    subjectName?: string;
  };
  duration: number; // en minutos
  onClose: () => void;
  onComplete: (rating: number) => void;
}

const FullscreenPomodoro: React.FC<FullscreenPomodoroProps> = ({
  item,
  duration,
  onClose,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convertir a segundos
  const [isActive, setIsActive] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [rating, setRating] = useState(0);
  const timerRef = useRef<any>(null);

  const color = item.color || '#6366f1';
  const totalSeconds = duration * 60;

  // Actualizar el tiempo cuando cambie la duración en settings
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

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

  const handleComplete = () => {
    setIsActive(false);
    playCompleteSound();
    setShowComplete(true);
  };

  const handleStart = () => {
    playStartSound();
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalSeconds);
  };

  const handleRatingAndClose = () => {
    onComplete(rating);
  };

  const playStartSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio no soportado', e);
    }
  };

  const playCompleteSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const frequencies = [523.25, 659.25, 783.99, 1046.50];

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);

        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
      });
    } catch (e) {
      console.log('Audio no soportado', e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 lg:top-12 md:right-8 lg:right-12 p-3 md:p-4 lg:p-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-2xl z-10"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Subject badge */}
      {item.subjectName && (
        <div className="absolute top-4 left-4 md:top-8 lg:top-12 md:left-8 lg:left-12 px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-xl md:rounded-2xl lg:rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 z-10">
          <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mb-0.5 md:mb-1">Materia</p>
          <p className="text-white font-black text-sm md:text-lg lg:text-xl truncate max-w-[150px] md:max-w-none" style={{ color: color }}>
            {item.subjectName}
          </p>
        </div>
      )}

      {!showComplete ? (
        <>
          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
            {/* Animated icon */}
            <div className="mb-6 md:mb-8 lg:mb-12 relative">
              <div className="absolute inset-0 blur-2xl md:blur-3xl opacity-50 animate-pulse" style={{ backgroundColor: color }} />
              <Flame className="relative drop-shadow-2xl animate-bounce w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" style={{ color: color }} />
            </div>

            {/* Study item title */}
            <div className="mb-8 md:mb-12 lg:mb-16 text-center px-4 md:px-8 animate-in fade-in slide-in-from-bottom duration-700 w-full">
              <p className="text-white/60 text-xs md:text-sm lg:text-xl font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                ESTUDIANDO
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-3 md:mb-6 drop-shadow-2xl leading-tight max-w-full break-words">
                {item.title}
              </h1>
              {isActive && (
                <p className="text-base md:text-xl lg:text-2xl text-white/80 font-bold animate-pulse">
                  ¡Mantén el enfoque! 🔥
                </p>
              )}
            </div>

            {/* Giant Timer Circle */}
            <div className="relative mb-8 md:mb-12 lg:mb-16 group">
              {/* Outer glow rings */}
              <div className={`absolute -inset-8 md:-inset-12 lg:-inset-16 rounded-full blur-2xl md:blur-3xl transition-all duration-1000 ${
                isActive
                  ? 'opacity-100 animate-pulse'
                  : 'opacity-0 group-hover:opacity-50'
              }`} style={{ backgroundColor: color + '40' }} />

              {isActive && (
                <>
                  <div className="absolute -inset-6 md:-inset-9 lg:-inset-12 rounded-full blur-xl md:blur-2xl animate-pulse" style={{ backgroundColor: color + '30', animationDelay: '0.5s' }} />
                  <div className="absolute -inset-4 md:-inset-6 lg:-inset-8 rounded-full blur-lg md:blur-xl animate-pulse" style={{ backgroundColor: color + '20', animationDelay: '1s' }} />
                </>
              )}

              <svg className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] -rotate-90 relative z-10 drop-shadow-2xl filter drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="50%" stopColor={color + 'cc'} />
                    <stop offset="100%" stopColor={color + '99'} />
                  </linearGradient>

                  <filter id="glow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Background circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  stroke="url(#bgGradient)"
                  strokeWidth="12"
                  fill="transparent"
                />

                {/* Progress circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  stroke="url(#progressGradient)"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray="276%"
                  strokeDashoffset={`${276 - (progressPercentage / 100) * 276}%`}
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Timer display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="text-6xl md:text-8xl lg:text-[180px] font-black leading-none text-white drop-shadow-2xl" style={{
                    WebkitTextStroke: '2px rgba(99, 102, 241, 0.2)',
                    textShadow: `0 0 40px ${color}80, 0 0 80px ${color}60`
                  }}>
                    {formatTime(timeLeft)}
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 blur-2xl md:blur-3xl opacity-40 animate-pulse" style={{ backgroundColor: color }} />
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-4 md:gap-8 lg:gap-12">
              <button
                onClick={handleReset}
                className="p-4 md:p-6 lg:p-8 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl group/btn"
              >
                <RotateCcw className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 group-hover/btn:rotate-180 transition-transform duration-500" />
              </button>

              <button
                onClick={isActive ? () => setIsActive(false) : handleStart}
                className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 group/play overflow-hidden"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                    : `linear-gradient(135deg, ${color}, ${color}dd)`
                }}
              >
                <div className={`absolute inset-0 transition-opacity ${
                  isActive
                    ? 'bg-gradient-to-tr from-orange-600 to-red-500'
                    : 'bg-gradient-to-tr from-purple-600 to-pink-500'
                } opacity-0 group-hover/play:opacity-100`} />

                <div className={`absolute -inset-2 md:-inset-3 lg:-inset-4 rounded-full blur-xl md:blur-2xl opacity-50 group-hover/play:opacity-75 transition-opacity`} style={{
                  backgroundColor: isActive ? '#f59e0b' : color
                }} />

                <div className="relative z-10">
                  {isActive ? (
                    <Pause className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" fill="currentColor" />
                  ) : (
                    <Play className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 ml-2 md:ml-3 lg:ml-4" fill="currentColor" />
                  )}
                </div>

                <div className="absolute inset-0 shimmer opacity-30" />
              </button>

              <button
                onClick={handleComplete}
                className="p-4 md:p-6 lg:p-8 rounded-full bg-green-500/20 backdrop-blur-xl border-2 border-green-500/50 text-green-400 hover:bg-green-500/30 hover:scale-110 active:scale-90 transition-all shadow-2xl"
              >
                <Star className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" fill="currentColor" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Completion Modal */
        <div className="relative z-10 w-full max-w-3xl animate-in zoom-in duration-500 px-4">
          <div className="p-6 md:p-10 lg:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] bg-white/10 backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 lg:mb-12 shadow-2xl rotate-3 animate-bounce">
              <Star className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" fill="currentColor" />
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-center mb-3 md:mb-4 lg:mb-6 text-white tracking-tight">
              ¡Sesión Completada!
            </h2>
            <p className="text-center text-white/80 font-bold mb-8 md:mb-12 lg:mb-16 text-base md:text-xl lg:text-2xl px-4">
              Excelente trabajo. ¿Cómo fue tu concentración?
            </p>

            <div className="flex justify-center gap-2 md:gap-4 lg:gap-6 mb-8 md:mb-12 lg:mb-16">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`transition-all hover:scale-125 ${
                    rating >= s ? 'text-yellow-400' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <Star
                    className="w-10 h-10 md:w-14 md:h-14 lg:w-[72px] lg:h-[72px]"
                    fill={rating >= s ? "currentColor" : "none"}
                    strokeWidth={3}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleRatingAndClose}
              disabled={rating === 0}
              className="w-full py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-base md:text-xl lg:text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: rating > 0
                  ? `linear-gradient(135deg, ${color}, ${color}dd)`
                  : 'rgba(255, 255, 255, 0.1)',
                color: rating > 0 ? 'white' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Finalizar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenPomodoro;
