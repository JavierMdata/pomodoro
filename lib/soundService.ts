/**
 * Servicio de Sonidos para PomoSmart
 * Usa Web Audio API para generar sonidos sin necesidad de archivos externos
 * AudioContext se inicializa de forma lazy en la primera interacción del usuario
 */

export class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Inicializa AudioContext solo cuando se necesita (tras gesto del usuario)
   */
  private ensureAudioContext() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      // @ts-ignore - webkit prefix para Safari
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Web Audio API no soportada:', error);
      this.enabled = false;
    }
  }

  /**
   * Activa/desactiva todos los sonidos
   */
  public toggleSound(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Resume el AudioContext si está suspendido (necesario para algunos navegadores)
   */
  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Toca una nota simple
   */
  private async playNote(frequency: number, duration: number, volume: number = 0.3, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;

    await this.resumeAudioContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Click suave para botones
   */
  public playClick() {
    this.playNote(800, 0.05, 0.2, 'sine');
  }

  /**
   * Click de toggle/switch
   */
  public playToggle() {
    this.playNote(600, 0.08, 0.15, 'triangle');
    setTimeout(() => this.playNote(900, 0.08, 0.15, 'triangle'), 50);
  }

  /**
   * Sonido de éxito/completado
   */
  public async playSuccess() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playNote(freq, 0.3, 0.2, 'sine');
      }, index * 150);
    });
  }

  /**
   * Sonido de inicio de Pomodoro (energético)
   */
  public async playStart() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    const notes = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.1 },  // E5
      { freq: 783.99, time: 0.2 }   // G5
    ];

    notes.forEach(({ freq, time }) => {
      setTimeout(() => {
        this.playNote(freq, 0.25, 0.3, 'sine');
      }, time * 1000);
    });
  }

  /**
   * Sonido de pausa
   */
  public async playPause() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    this.playNote(659.25, 0.15, 0.25, 'sine'); // E5
    setTimeout(() => {
      this.playNote(523.25, 0.2, 0.2, 'sine'); // C5
    }, 100);
  }

  /**
   * Sonido de notificación suave
   */
  public async playNotification() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    // Doble beep suave
    this.playNote(880, 0.15, 0.25, 'sine');
    setTimeout(() => {
      this.playNote(880, 0.15, 0.25, 'sine');
    }, 200);
  }

  /**
   * Sonido de alerta/advertencia
   */
  public async playAlert() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    // Triple beep urgente
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playNote(440, 0.1, 0.3, 'square');
      }, i * 150);
    }
  }

  /**
   * Campana de finalización de Pomodoro
   */
  public async playComplete() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.5);

        oscillator.start(this.audioContext.currentTime + index * 0.15);
        oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.5);
      }, 0);
    });
  }

  /**
   * Tic-tac del reloj (sutil)
   */
  public playTick() {
    this.playNote(1000, 0.02, 0.05, 'square');
  }

  /**
   * Whoosh (para transiciones)
   */
  public async playWhoosh() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Sweep descendente
    oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Error/rechazo
   */
  public async playError() {
    if (!this.enabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;
    await this.resumeAudioContext();

    // Dos tonos bajos
    this.playNote(200, 0.2, 0.3, 'square');
    setTimeout(() => {
      this.playNote(150, 0.25, 0.3, 'square');
    }, 150);
  }

  /**
   * Reproduce vibración táctil si está disponible
   */
  public vibrate(pattern: number | number[] = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Feedback táctil + sonido combinado
   */
  public hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };

    this.vibrate(patterns[type]);
    this.playClick();
  }
}

// Exportar instancia singleton
export const soundService = new SoundService();

// Tipos de TypeScript
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
