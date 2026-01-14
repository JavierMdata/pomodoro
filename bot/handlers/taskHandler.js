import { supabaseService } from '../services/supabaseService.js';
import { aiService } from '../services/aiService.js';
import { config } from '../config.js';
import { parseRelativeDate, parseTime, formatDateRelative } from '../utils/dateUtils.js';

export class TaskHandler {
  /**
   * Lista todas las tareas pendientes del usuario
   */
  static async handleListTasks(bot, msg, profile) {
    const chatId = msg.chat.id;
    const tasks = await supabaseService.getTasksByProfile(profile.id);

    const pendingTasks = tasks.filter(t => t.status !== 'completed');

    if (pendingTasks.length === 0) {
      const gender = profile.gender || 'otro';
      const motivation = config.MOTIVATION[gender];

      await bot.sendMessage(
        chatId,
        `${motivation.done}\n\n¡No tienes tareas pendientes!\n\n` +
        `¿Quieres agregar una nueva o revisar tus materiales? 📚`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Agrupar por prioridad
    const alta = pendingTasks.filter(t => t.priority === 'alta');
    const media = pendingTasks.filter(t => t.priority === 'media');
    const baja = pendingTasks.filter(t => t.priority === 'baja');

    let message = `📝 *Tus Tareas Pendientes* (${pendingTasks.length})\n\n`;

    if (alta.length > 0) {
      message += `🔴 *ALTA PRIORIDAD:*\n`;
      alta.forEach(t => {
        const dueDate = t.due_date ? ` - ${formatDateRelative(t.due_date)}` : '';
        message += `• ${t.title} (${t.subjects?.name})${dueDate}\n`;
      });
      message += '\n';
    }

    if (media.length > 0) {
      message += `🟡 *Media:*\n`;
      media.slice(0, 5).forEach(t => {
        const dueDate = t.due_date ? ` - ${formatDateRelative(t.due_date)}` : '';
        message += `• ${t.title} (${t.subjects?.name})${dueDate}\n`;
      });
      if (media.length > 5) {
        message += `  ... y ${media.length - 5} más\n`;
      }
      message += '\n';
    }

    if (baja.length > 0) {
      message += `🟢 *Baja:* ${baja.length} tareas\n\n`;
    }

    message += `💡 Usa /pomo para iniciar una sesión de estudio.`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Crea una nueva tarea desde lenguaje natural
   */
  static async handleCreateTask(bot, msg, profile, messageText) {
    const chatId = msg.chat.id;

    // Obtener contexto
    const subjects = await supabaseService.getSubjectsByProfile(profile.id);
    const tasks = await supabaseService.getTasksByProfile(profile.id);

    // Parsear con AI
    const parsed = await aiService.parseUserIntent(messageText, {
      subjects,
      pendingTasks: tasks.filter(t => t.status !== 'completed').length
    });

    const { entities } = parsed;

    // Encontrar la materia
    let subject = null;
    if (entities.subject) {
      subject = subjects.find(s =>
        s.name.toLowerCase().includes(entities.subject.toLowerCase()) ||
        entities.subject.toLowerCase().includes(s.name.toLowerCase())
      );
    }

    // Si no hay materia, preguntar
    if (!subject) {
      if (subjects.length === 0) {
        await bot.sendMessage(
          chatId,
          '⚠️ Primero necesitas crear una materia.\n\n' +
          '¿Cómo se llama la materia? (ej: "Matemáticas")',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const keyboard = {
        inline_keyboard: subjects.slice(0, 10).map(s => [
          { text: s.name, callback_data: `create_task_subject:${s.id}:${messageText}` }
        ])
      };

      await bot.sendMessage(
        chatId,
        '¿Para qué materia es esta tarea?',
        { reply_markup: keyboard }
      );
      return;
    }

    // Extraer título
    let title = entities.title || messageText;
    // Limpiar el título
    title = title
      .replace(/^(agregar|crear|nueva?|hacer|pendiente|tarea de?)\s*/gi, '')
      .replace(new RegExp(subject.name, 'gi'), '')
      .replace(/\s+(para|de|el|la|los|las)\s+/gi, ' ')
      .trim();

    if (!title || title.length < 3) {
      await bot.sendMessage(
        chatId,
        '⚠️ ¿Cuál es el título de la tarea?\n\n' +
        'Ejemplo: "Resolver ejercicios del capítulo 5"',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Parsear fecha
    const dueDate = entities.date || parseRelativeDate(messageText);

    // Determinar prioridad
    const priority = entities.priority || 'media';

    // Crear la tarea
    const newTask = await supabaseService.createTask(
      subject.id,
      title,
      entities.description || '',
      priority,
      dueDate
    );

    if (newTask) {
      const gender = profile.gender || 'otro';
      const motivation = config.MOTIVATION[gender];

      const dateInfo = dueDate ? `\n📅 Fecha: ${formatDateRelative(dueDate)}` : '';
      const priorityEmoji = priority === 'alta' ? '🔴' : priority === 'media' ? '🟡' : '🟢';

      await bot.sendMessage(
        chatId,
        `✅ ¡Tarea creada!\n\n` +
        `${priorityEmoji} *${title}*\n` +
        `📚 Materia: ${subject.name}${dateInfo}\n\n` +
        `${motivation.encouragement} ¿Empezamos con un Pomodoro? /pomo`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(
        chatId,
        '❌ Hubo un error al crear la tarea. Intenta de nuevo.',
        { parse_mode: 'Markdown' }
      );
    }
  }

  /**
   * Lista exámenes próximos
   */
  static async handleListExams(bot, msg, profile) {
    const chatId = msg.chat.id;
    const exams = await supabaseService.getExamsByProfile(profile.id);

    const upcomingExams = exams
      .filter(e => e.status !== 'completed' && new Date(e.exam_date) >= new Date())
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

    if (upcomingExams.length === 0) {
      await bot.sendMessage(
        chatId,
        `✨ No tienes exámenes próximos registrados.\n\n` +
        `Para agregar uno, escribe:\n` +
        `"Tengo examen de [Materia] el [día] a las [hora]"`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = `🎯 *Exámenes Próximos* (${upcomingExams.length})\n\n`;

    upcomingExams.slice(0, 8).forEach(exam => {
      const date = formatDateRelative(exam.exam_date);
      const time = exam.exam_time ? ` a las ${exam.exam_time}` : '';
      const location = exam.location ? ` 📍 ${exam.location}` : '';

      message += `${date}\n`;
      message += `📚 *${exam.title}* (${exam.subjects?.name})${time}${location}\n\n`;
    });

    if (upcomingExams.length > 8) {
      message += `... y ${upcomingExams.length - 8} más\n\n`;
    }

    const nextExam = upcomingExams[0];
    const daysUntil = Math.ceil((new Date(nextExam.exam_date) - new Date()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 3) {
      const gender = profile.gender || 'otro';
      const urgency = config.MOTIVATION[gender].urgency;
      message += `\n${urgency} - ${daysUntil === 0 ? '¡Es hoy!' : `En ${daysUntil} días`}`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Crea un examen desde lenguaje natural
   */
  static async handleCreateExam(bot, msg, profile, messageText) {
    const chatId = msg.chat.id;

    // Obtener contexto
    const subjects = await supabaseService.getSubjectsByProfile(profile.id);

    // Parsear fecha y hora
    const examDate = parseRelativeDate(messageText);
    const examTime = parseTime(messageText);

    if (!examDate) {
      await bot.sendMessage(
        chatId,
        '⚠️ No pude detectar la fecha del examen.\n\n' +
        'Intenta algo como:\n' +
        '• "Examen de Física el martes"\n' +
        '• "Examen de Matemáticas el 15/03"\n' +
        '• "Examen mañana a las 10"',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Detectar materia
    let subject = null;
    const lowerMsg = messageText.toLowerCase();

    for (const s of subjects) {
      if (lowerMsg.includes(s.name.toLowerCase())) {
        subject = s;
        break;
      }
    }

    if (!subject) {
      const keyboard = {
        inline_keyboard: subjects.slice(0, 10).map(s => [
          {
            text: s.name,
            callback_data: `create_exam:${s.id}:${examDate}:${examTime || 'null'}`
          }
        ])
      };

      await bot.sendMessage(
        chatId,
        '¿De qué materia es el examen?',
        { reply_markup: keyboard }
      );
      return;
    }

    // Crear el examen
    const title = `Examen de ${subject.name}`;
    const newExam = await supabaseService.createExam(
      subject.id,
      title,
      examDate,
      examTime
    );

    if (newExam) {
      const gender = profile.gender || 'otro';
      const motivation = config.MOTIVATION[gender];

      const timeInfo = examTime ? ` a las ${examTime}` : '';

      await bot.sendMessage(
        chatId,
        `✅ ¡Examen agendado!\n\n` +
        `🎯 *${title}*\n` +
        `📅 ${formatDateRelative(examDate)}${timeInfo}\n\n` +
        `${motivation.focus} ¡A prepararse!`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(
        chatId,
        '❌ Error al crear el examen. Intenta de nuevo.',
        { parse_mode: 'Markdown' }
      );
    }
  }

  /**
   * Lista materiales de estudio
   */
  static async handleListMaterials(bot, msg, profile) {
    const chatId = msg.chat.id;
    const materials = await supabaseService.getMaterialsByProfile(profile.id);

    if (materials.length === 0) {
      await bot.sendMessage(
        chatId,
        `📚 No tienes materiales guardados aún.\n\n` +
        `Para agregar uno, envíame:\n` +
        `• Un enlace\n` +
        `• "Guardar material: [título]"\n` +
        `• "Apuntes de [materia]: [contenido]"`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = `📚 *Materiales de Estudio* (${materials.length})\n\n`;

    materials.slice(0, 10).forEach(m => {
      const typeEmoji = m.type === 'video' ? '🎥' : m.type === 'document' ? '📄' : '📝';
      const status = m.status === 'completed' ? '✅' : m.status === 'in_progress' ? '🔄' : '⏳';

      message += `${typeEmoji} ${status} *${m.title}*\n`;
      message += `   ${m.subjects?.name}`;

      if (m.url) {
        message += ` - [Ver](${m.url})`;
      }

      message += '\n\n';
    });

    if (materials.length > 10) {
      message += `... y ${materials.length - 10} más`;
    }

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }
}
