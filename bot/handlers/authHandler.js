import { supabaseService } from '../services/supabaseService.js';
import { config } from '../config.js';

export class AuthHandler {
  /**
   * Maneja el comando /start
   */
  static async handleStart(bot, msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    // Verificar si el usuario ya está vinculado
    const profile = await supabaseService.getProfileByTelegramId(chatId);

    if (profile) {
      const gender = profile.gender || 'otro';
      const greeting = config.MOTIVATION[gender].greeting;

      await bot.sendMessage(
        chatId,
        `${greeting}\n\n¡Ya estás conectado como *${profile.user_name}*! 🎉\n\n` +
        `Puedo ayudarte con:\n` +
        `📝 Gestionar tus tareas\n` +
        `📚 Organizar materiales de estudio\n` +
        `🎯 Recordarte exámenes\n` +
        `⏱️ Iniciar sesiones Pomodoro\n` +
        `📊 Ver tus estadísticas\n\n` +
        `Escribe /ayuda para ver todos los comandos.\n` +
        `O simplemente chatea conmigo, ¡entiendo lenguaje natural! 😊`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `👋 ¡Hola! Soy tu asistente de PomoSmart.\n\n` +
        `Para empezar, necesito vincular tu Telegram con tu perfil.\n\n` +
        `*Opción 1:* Envía tu código de vinculación\n` +
        `*Opción 2:* Usa /vincular <código>\n\n` +
        `¿Dónde encuentro mi código?\n` +
        `👉 Ve a tu perfil en PomoSmart Web y copia el código de vinculación.`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  /**
   * Vincula un perfil con Telegram usando email
   */
  static async handleLink(bot, msg, linkCode) {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    if (!linkCode) {
      await bot.sendMessage(
        chatId,
        '⚠️ Necesito tu código de vinculación.\n\n' +
        'Uso: `/vincular TU_CODIGO`\n\n' +
        'Obtén tu código desde tu perfil en PomoSmart Web.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Buscar perfil por email o código
    const allProfiles = await supabaseService.getAllProfiles();
    const profile = allProfiles.find(p =>
      p.email?.toLowerCase() === linkCode.toLowerCase() ||
      p.user_name?.toLowerCase() === linkCode.toLowerCase() ||
      p.id === linkCode
    );

    if (!profile) {
      await bot.sendMessage(
        chatId,
        '❌ No encontré ningún perfil con ese código.\n\n' +
        'Verifica que:\n' +
        '• El código esté escrito correctamente\n' +
        '• Tu perfil exista en PomoSmart Web\n\n' +
        'Intenta con tu email o nombre de usuario.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Verificar si ya está vinculado a otro Telegram
    if (profile.telegram_chat_id && profile.telegram_chat_id !== chatId) {
      await bot.sendMessage(
        chatId,
        '⚠️ Este perfil ya está vinculado a otra cuenta de Telegram.\n\n' +
        'Si eres tú, contacta al administrador para desvincular la cuenta anterior.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Vincular
    const linked = await supabaseService.linkTelegramToProfile(
      profile.id,
      chatId.toString(),
      username
    );

    if (linked) {
      const gender = profile.gender || 'otro';
      const greeting = config.MOTIVATION[gender].greeting;

      await bot.sendMessage(
        chatId,
        `${greeting}\n\n` +
        `✅ ¡Vinculación exitosa!\n\n` +
        `Ahora estás conectado como *${profile.user_name}*.\n\n` +
        `Ya puedes:\n` +
        `💬 Chatear conmigo en lenguaje natural\n` +
        `📝 Crear tareas: "Agregar tarea de Física para mañana"\n` +
        `🎯 Agendar exámenes: "Tengo examen de Cálculo el viernes"\n` +
        `⏱️ Iniciar Pomodoros: "Vamos a estudiar"\n` +
        `📊 Ver stats: /stats\n\n` +
        `Escribe /ayuda para ver más opciones.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(
        chatId,
        '❌ Hubo un error al vincular tu cuenta. Intenta de nuevo.',
        { parse_mode: 'Markdown' }
      );
    }
  }

  /**
   * Muestra información de ayuda
   */
  static async handleHelp(bot, msg) {
    const chatId = msg.chat.id;

    const helpText = `🤖 *Guía de PomoSmart Bot*\n\n` +
      `*Comandos básicos:*\n` +
      `/start - Iniciar el bot\n` +
      `/vincular <código> - Vincular tu perfil\n` +
      `/ayuda - Mostrar esta ayuda\n` +
      `/perfil - Ver tu perfil\n\n` +
      `*Gestión de tareas:*\n` +
      `/tareas - Ver tareas pendientes\n` +
      `/examenes - Ver exámenes próximos\n` +
      `/materiales - Ver materiales de estudio\n\n` +
      `*Pomodoro:*\n` +
      `/pomo - Iniciar sesión Pomodoro\n` +
      `/parar - Detener Pomodoro actual\n` +
      `/stats - Ver estadísticas\n\n` +
      `*💡 Lenguaje Natural:*\n` +
      `También puedo entender mensajes como:\n` +
      `• "Agregar tarea de Matemáticas para mañana"\n` +
      `• "Tengo examen de Física el martes a las 10"\n` +
      `• "Vamos a estudiar"\n` +
      `• "¿Qué tengo pendiente?"\n` +
      `• "Guarda este enlace: [url]"\n\n` +
      `¡Solo escríbeme naturalmente! 😊`;

    await bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static async requireAuth(bot, msg) {
    const chatId = msg.chat.id;
    const profile = await supabaseService.getProfileByTelegramId(chatId);

    if (!profile) {
      await bot.sendMessage(
        chatId,
        '⚠️ Primero necesitas vincular tu cuenta.\n\n' +
        'Usa /start para comenzar.',
        { parse_mode: 'Markdown' }
      );
      return null;
    }

    return profile;
  }
}
