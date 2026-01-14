import cron from 'node-cron';
import { supabaseService } from '../services/supabaseService.js';
import { aiService } from '../services/aiService.js';
import { config } from '../config.js';
import { formatDateRelative } from '../utils/dateUtils.js';

export class NotificationHandler {
  static bot = null;

  /**
   * Inicializa el sistema de notificaciones
   */
  static init(bot) {
    this.bot = bot;

    // Recordatorio matutino (9:00 AM)
    cron.schedule('0 9 * * *', () => {
      this.sendMorningReminders();
    });

    // Recordatorio de tarde (2:00 PM)
    cron.schedule('0 14 * * *', () => {
      this.sendAfternoonSuggestions();
    });

    // Recordatorio de exámenes próximos (8:00 PM)
    cron.schedule('0 20 * * *', () => {
      this.sendExamReminders();
    });

    // Motivación al azar durante el día (cada 4 horas entre 10am-8pm)
    cron.schedule('0 10,14,18 * * *', () => {
      this.sendRandomMotivation();
    });

    console.log('✅ Sistema de notificaciones proactivas iniciado');
  }

  /**
   * Recordatorio matutino personalizado
   */
  static async sendMorningReminders() {
    const profiles = await supabaseService.getAllProfiles();

    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;

      try {
        const tasks = await supabaseService.getTasksByProfile(profile.id);
        const exams = await supabaseService.getExamsByProfile(profile.id);

        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        const todayTasks = pendingTasks.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          const today = new Date();
          return dueDate.toDateString() === today.toDateString();
        });

        const urgentExams = exams.filter(e => {
          const examDate = new Date(e.exam_date);
          const today = new Date();
          const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 3;
        });

        if (todayTasks.length === 0 && urgentExams.length === 0) continue;

        const gender = profile.gender || 'otro';
        const greeting = config.MOTIVATION[gender].greeting;

        let message = `${greeting}\n\n`;
        message += `☀️ *Buenos días, ${profile.user_name}*\n\n`;

        if (todayTasks.length > 0) {
          message += `📝 Tienes ${todayTasks.length} tarea${todayTasks.length > 1 ? 's' : ''} para hoy:\n`;
          todayTasks.slice(0, 3).forEach(t => {
            message += `• ${t.title}\n`;
          });
          message += '\n';
        }

        if (urgentExams.length > 0) {
          message += `🎯 Exámenes próximos:\n`;
          urgentExams.forEach(e => {
            const date = formatDateRelative(e.exam_date);
            message += `• ${e.title} - ${date}\n`;
          });
          message += '\n';
        }

        message += `💪 ¿Arrancamos con un Pomodoro? /pomo`;

        await this.bot.sendMessage(profile.telegram_chat_id, message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`Error sending morning reminder to ${profile.user_name}:`, error);
      }
    }
  }

  /**
   * Sugerencias de estudio por la tarde
   */
  static async sendAfternoonSuggestions() {
    const profiles = await supabaseService.getAllProfiles();

    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;

      try {
        // Verificar si el usuario ha estudiado hoy
        const todaySessions = await supabaseService.getSessionsByProfile(profile.id, 1);

        // Si ya tiene 3+ sesiones hoy, no molestar
        if (todaySessions.length >= 3) continue;

        const tasks = await supabaseService.getTasksByProfile(profile.id);
        const exams = await supabaseService.getExamsByProfile(profile.id);

        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        const urgentTasks = pendingTasks.filter(t => t.priority === 'alta');

        if (urgentTasks.length === 0) continue;

        // Generar sugerencia con AI
        const suggestion = await aiService.generateStudySuggestion(
          profile,
          urgentTasks,
          exams
        );

        const gender = profile.gender || 'otro';
        const focus = config.MOTIVATION[gender].focus;

        let message = `${focus}\n\n`;
        message += `🔥 *Momento productivo*\n\n`;
        message += `💡 ${suggestion}\n\n`;

        if (todaySessions.length > 0) {
          message += `Llevas ${todaySessions.length} sesión${todaySessions.length > 1 ? 'es' : ''} hoy. `;
        }

        message += `¿Le damos? /pomo`;

        await this.bot.sendMessage(profile.telegram_chat_id, message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`Error sending afternoon suggestion to ${profile.user_name}:`, error);
      }
    }
  }

  /**
   * Recordatorios de exámenes por la noche
   */
  static async sendExamReminders() {
    const profiles = await supabaseService.getAllProfiles();

    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;

      try {
        const exams = await supabaseService.getExamsByProfile(profile.id);

        // Exámenes mañana
        const tomorrowExams = exams.filter(e => {
          const examDate = new Date(e.exam_date);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return examDate.toDateString() === tomorrow.toDateString();
        });

        if (tomorrowExams.length === 0) continue;

        const gender = profile.gender || 'otro';
        const urgency = config.MOTIVATION[gender].urgency;

        let message = `${urgency}\n\n`;
        message += `⚡ *Recordatorio Importante*\n\n`;
        message += `🎯 Mañana tienes:\n`;

        tomorrowExams.forEach(e => {
          const time = e.exam_time ? ` a las ${e.exam_time}` : '';
          const location = e.location ? ` en ${e.location}` : '';
          message += `• ${e.title}${time}${location}\n`;
        });

        message += `\n¿Todo listo? Si no, aún hay tiempo. /pomo`;

        await this.bot.sendMessage(profile.telegram_chat_id, message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`Error sending exam reminder to ${profile.user_name}:`, error);
      }
    }
  }

  /**
   * Envía motivación aleatoria
   */
  static async sendRandomMotivation() {
    const profiles = await supabaseService.getAllProfiles();

    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;

      try {
        // Solo enviar a usuarios con actividad reciente (última semana)
        const recentSessions = await supabaseService.getSessionsByProfile(profile.id, 7);
        if (recentSessions.length === 0) continue;

        // 30% de probabilidad de enviar (no ser muy molesto)
        if (Math.random() > 0.3) continue;

        const tasks = await supabaseService.getTasksByProfile(profile.id);
        const pendingTasks = tasks.filter(t => t.status !== 'completed');

        if (pendingTasks.length === 0) continue;

        // Generar mensaje motivacional
        const context = `El usuario tiene ${pendingTasks.length} tareas pendientes y ha completado ${recentSessions.length} sesiones esta semana.`;
        const motivation = await aiService.generateMotivationalResponse(profile, context);

        const gender = profile.gender || 'otro';
        const encouragement = config.MOTIVATION[gender].encouragement;

        const finalMessage = motivation || encouragement;

        await this.bot.sendMessage(
          profile.telegram_chat_id,
          `💪 ${finalMessage}\n\n¿Un Pomodoro rápido? /pomo`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error(`Error sending motivation to ${profile.user_name}:`, error);
      }
    }
  }

  /**
   * Envía notificación personalizada a un usuario
   */
  static async sendCustomNotification(chatId, message, options = {}) {
    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...options
      });
    } catch (error) {
      console.error(`Error sending notification to ${chatId}:`, error);
    }
  }
}
