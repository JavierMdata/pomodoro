import { supabaseService } from '../services/supabaseService.js';
import { aiService } from '../services/aiService.js';
import { config } from '../config.js';
import { formatTime } from '../utils/dateUtils.js';

// Almacenar temporizadores activos en memoria
const activeTimers = new Map();

export class PomodoroHandler {
  /**
   * Inicia una sesión Pomodoro
   */
  static async handleStartPomodoro(bot, msg, profile) {
    const chatId = msg.chat.id;

    // Verificar si ya hay una sesión activa
    const activeSession = await supabaseService.getActivePomodoroSession(profile.id);
    if (activeSession) {
      await bot.sendMessage(
        chatId,
        `⏱️ Ya tienes una sesión Pomodoro activa.\n\n` +
        `Usa /parar para detenerla o espera a que termine.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Obtener tareas y materiales
    const tasks = await supabaseService.getTasksByProfile(profile.id);
    const materials = await supabaseService.getMaterialsByProfile(profile.id);
    const exams = await supabaseService.getExamsByProfile(profile.id);

    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const pendingMaterials = materials.filter(m => m.status !== 'completed');

    // Si no hay nada pendiente, sugerir algo
    if (pendingTasks.length === 0 && pendingMaterials.length === 0) {
      await bot.sendMessage(
        chatId,
        `📚 No tienes tareas o materiales pendientes.\n\n` +
        `¿Quieres:\n` +
        `1️⃣ Crear una tarea nueva (/tareas)\n` +
        `2️⃣ Iniciar un Pomodoro general (responde "general")`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Generar sugerencia de qué estudiar
    const suggestion = await aiService.generateStudySuggestion(profile, pendingTasks, exams);

    // Crear teclado con opciones
    const options = [];

    // Top 3 tareas prioritarias
    pendingTasks
      .filter(t => t.priority === 'alta')
      .slice(0, 3)
      .forEach(t => {
        options.push([{
          text: `🔥 ${t.title.substring(0, 35)}`,
          callback_data: `pomo_start:task:${t.id}`
        }]);
      });

    // Top 2 materiales
    pendingMaterials
      .slice(0, 2)
      .forEach(m => {
        options.push([{
          text: `📚 ${m.title.substring(0, 35)}`,
          callback_data: `pomo_start:material:${m.id}`
        }]);
      });

    // Opción general
    options.push([{
      text: '🎯 Sesión General',
      callback_data: 'pomo_start:general:null'
    }]);

    const keyboard = { inline_keyboard: options };

    const gender = profile.gender || 'otro';
    const focus = config.MOTIVATION[gender].focus;

    await bot.sendMessage(
      chatId,
      `${focus}\n\n💡 ${suggestion}\n\n¿En qué vamos a trabajar?`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  }

  /**
   * Callback para iniciar el Pomodoro con el item seleccionado
   */
  static async handlePomodoroStart(bot, query, profile) {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const [_, type, itemId] = query.data.split(':');

    // Obtener settings del usuario
    const settings = await supabaseService.getProfileByTelegramId(chatId);
    const workDuration = 25; // Por defecto 25 min (puedes obtenerlo de settings si está disponible)

    // Crear sesión en la base de datos
    const sessionData = {
      task_id: type === 'task' ? itemId : null,
      material_id: type === 'material' ? itemId : null,
      session_type: 'work',
      planned_duration_minutes: workDuration,
      duration_seconds: 0,
      status: 'in_progress',
      started_at: new Date().toISOString()
    };

    const session = await supabaseService.createPomodoroSession(profile.id, sessionData);

    if (!session) {
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Error al iniciar sesión',
        show_alert: true
      });
      return;
    }

    // Iniciar temporizador
    const timerData = {
      sessionId: session.id,
      profileId: profile.id,
      chatId,
      messageId: null, // Se actualizará
      startTime: Date.now(),
      duration: workDuration * 60, // en segundos
      elapsed: 0,
      itemType: type,
      itemId
    };

    // Enviar mensaje de inicio
    const gender = profile.gender || 'otro';
    const focusMsg = config.MOTIVATION[gender].focus;

    let itemName = 'Sesión General';
    if (type === 'task') {
      const tasks = await supabaseService.getTasksByProfile(profile.id);
      const task = tasks.find(t => t.id === itemId);
      itemName = task?.title || itemName;
    } else if (type === 'material') {
      const materials = await supabaseService.getMaterialsByProfile(profile.id);
      const material = materials.find(m => m.id === itemId);
      itemName = material?.title || itemName;
    }

    // Eliminar mensaje anterior
    await bot.deleteMessage(chatId, messageId);

    // Enviar mensaje del temporizador
    const timerMessage = await bot.sendMessage(
      chatId,
      this.formatTimerMessage(workDuration * 60, itemName, focusMsg),
      { parse_mode: 'Markdown' }
    );

    timerData.messageId = timerMessage.message_id;
    activeTimers.set(chatId, timerData);

    // Iniciar el temporizador
    this.startTimer(bot, chatId);

    await bot.answerCallbackQuery(query.id, {
      text: '✅ ¡Pomodoro iniciado!'
    });
  }

  /**
   * Timer loop
   */
  static startTimer(bot, chatId) {
    const timerData = activeTimers.get(chatId);
    if (!timerData) return;

    const interval = setInterval(async () => {
      const timer = activeTimers.get(chatId);
      if (!timer) {
        clearInterval(interval);
        return;
      }

      timer.elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
      const remaining = timer.duration - timer.elapsed;

      if (remaining <= 0) {
        // Temporizador completado
        clearInterval(interval);
        await this.handlePomodoroComplete(bot, chatId, timer);
        return;
      }

      // Actualizar mensaje cada 60 segundos
      if (timer.elapsed % 60 === 0) {
        try {
          const itemName = timer.itemType === 'general' ? 'Sesión General' : 'Estudiando';
          await bot.editMessageText(
            this.formatTimerMessage(remaining, itemName, '⏱️'),
            {
              chat_id: chatId,
              message_id: timer.messageId,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [[
                  { text: '⏸️ Pausar', callback_data: 'pomo_pause' },
                  { text: '⏹️ Detener', callback_data: 'pomo_stop' }
                ]]
              }
            }
          );
        } catch (error) {
          // Mensaje eliminado o error, detener timer
          if (error.response?.body?.error_code === 400) {
            clearInterval(interval);
            activeTimers.delete(chatId);
          }
        }
      }
    }, 1000);
  }

  /**
   * Formatea el mensaje del temporizador
   */
  static formatTimerMessage(seconds, itemName, emoji) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    return `${emoji} *Pomodoro en curso*\n\n` +
      `⏰ ${timeStr}\n` +
      `📌 ${itemName}\n\n` +
      `_Mantén el enfoque... ¡Tú puedes!_`;
  }

  /**
   * Completa el Pomodoro
   */
  static async handlePomodoroComplete(bot, chatId, timerData) {
    activeTimers.delete(chatId);

    // Actualizar sesión en BD
    await supabaseService.updatePomodoroSession(timerData.sessionId, {
      status: 'completed',
      duration_seconds: timerData.elapsed,
      completed_at: new Date().toISOString()
    });

    // Obtener perfil para personalización
    const profile = await supabaseService.getProfileByTelegramId(chatId);
    const gender = profile?.gender || 'otro';
    const celebration = config.MOTIVATION[gender].celebration;

    // Teclado para rating
    const keyboard = {
      inline_keyboard: [
        [
          { text: '⭐', callback_data: `pomo_rate:${timerData.sessionId}:1` },
          { text: '⭐⭐', callback_data: `pomo_rate:${timerData.sessionId}:2` },
          { text: '⭐⭐⭐', callback_data: `pomo_rate:${timerData.sessionId}:3` }
        ],
        [
          { text: '⭐⭐⭐⭐', callback_data: `pomo_rate:${timerData.sessionId}:4` },
          { text: '⭐⭐⭐⭐⭐', callback_data: `pomo_rate:${timerData.sessionId}:5` }
        ]
      ]
    };

    await bot.editMessageText(
      `✅ *¡Pomodoro Completado!*\n\n` +
      `${celebration}\n\n` +
      `⏱️ Tiempo: ${formatTime(timerData.elapsed)}\n\n` +
      `¿Cómo fue tu concentración?`,
      {
        chat_id: chatId,
        message_id: timerData.messageId,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  }

  /**
   * Detiene el Pomodoro actual
   */
  static async handleStopPomodoro(bot, msg, profile) {
    const chatId = msg.chat.id;
    const timerData = activeTimers.get(chatId);

    if (!timerData) {
      await bot.sendMessage(
        chatId,
        '⚠️ No tienes ninguna sesión Pomodoro activa.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Eliminar timer
    activeTimers.delete(chatId);

    // Actualizar sesión como cancelada
    await supabaseService.updatePomodoroSession(timerData.sessionId, {
      status: 'cancelled',
      duration_seconds: timerData.elapsed,
      completed_at: new Date().toISOString()
    });

    await bot.sendMessage(
      chatId,
      `⏹️ Sesión Pomodoro detenida.\n\n` +
      `Tiempo transcurrido: ${formatTime(timerData.elapsed)}\n\n` +
      `¡No pasa nada! ¿Quieres intentar de nuevo? /pomo`,
      { parse_mode: 'Markdown' }
    );
  }

  /**
   * Califica la sesión Pomodoro
   */
  static async handleRatePomodoro(bot, query) {
    const [_, sessionId, rating] = query.data.split(':');

    await supabaseService.updatePomodoroSession(sessionId, {
      focus_rating: parseInt(rating)
    });

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }
    );

    await bot.answerCallbackQuery(query.id, {
      text: `Gracias por tu feedback! ⭐${rating}`
    });

    // Mensaje de seguimiento
    await bot.sendMessage(
      query.message.chat.id,
      `🔥 ¡Sesión registrada!\n\n` +
      `¿Listo para otra ronda? /pomo\n` +
      `O toma un descanso. ¡Te lo ganaste! 😊`,
      { parse_mode: 'Markdown' }
    );
  }

  /**
   * Muestra estadísticas
   */
  static async handleStats(bot, msg, profile) {
    const chatId = msg.chat.id;

    // Obtener sesiones de los últimos 7 días
    const sessions = await supabaseService.getSessionsByProfile(profile.id, 7);

    if (sessions.length === 0) {
      await bot.sendMessage(
        chatId,
        `📊 *Tus Estadísticas*\n\n` +
        `Aún no tienes sesiones registradas.\n\n` +
        `¡Inicia tu primer Pomodoro! /pomo`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Calcular estadísticas
    const totalSessions = sessions.length;
    const totalMinutes = Math.floor(
      sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
    );
    const avgFocus = sessions
      .filter(s => s.focus_rating)
      .reduce((sum, s) => sum + s.focus_rating, 0) / sessions.filter(s => s.focus_rating).length || 0;

    // Sesiones por día
    const today = sessions.filter(s => {
      const date = new Date(s.completed_at);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length;

    const gender = profile.gender || 'otro';
    const done = config.MOTIVATION[gender].done;

    let message = `📊 *Tus Estadísticas* (últimos 7 días)\n\n`;
    message += `🔥 Sesiones completadas: ${totalSessions}\n`;
    message += `⏱️ Tiempo total: ${totalMinutes} minutos\n`;
    message += `⭐ Concentración promedio: ${avgFocus.toFixed(1)}/5\n`;
    message += `📅 Hoy: ${today} sesiones\n\n`;

    if (totalSessions >= 5) {
      message += `${done} ¡Vas muy bien!`;
    } else {
      message += `💪 ¡Sigue así! Cada sesión cuenta.`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }
}
