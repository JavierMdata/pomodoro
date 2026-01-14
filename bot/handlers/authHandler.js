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
      // Usuario ya vinculado - saludo personalizado
      await this.greetUser(bot, chatId, profile);
    } else {
      // Usuario nuevo - pedir vinculación
      await bot.sendMessage(
        chatId,
        `👋 ¡Hola! Soy *${config.BOT_NAME}*\n\n` +
        `Para empezar, vincúlate con tu perfil de PomoSmart:\n\n` +
        `/vincular TU_EMAIL\n\n` +
        `_Ejemplo: /vincular leo@universidad.com_`,
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
      // Vinculación exitosa - saludar al usuario
      await this.greetUser(bot, chatId, linked);
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

    const helpText = `🤖 *${config.BOT_NAME} - Guía*\n\n` +
      `*🔐 Configuración:*\n` +
      `/start - Iniciar\n` +
      `/vincular <email> - Vincular perfil\n` +
      `/perfil - Ver info\n` +
      `/cambiar_nombre <nombre> - Cambiar tu nombre\n\n` +
      `*📝 Gestión:*\n` +
      `/tareas - Ver pendientes\n` +
      `/examenes - Ver exámenes\n` +
      `/materiales - Ver materiales\n\n` +
      `*⏱️ Pomodoro:*\n` +
      `/pomo - Iniciar sesión\n` +
      `/parar - Detener sesión\n` +
      `/stats - Ver estadísticas\n\n` +
      `*💬 Lenguaje Natural:*\n` +
      `Habla conmigo naturalmente:\n` +
      `• "Agregar tarea de Física para mañana"\n` +
      `• "Tengo examen de Cálculo el martes a las 10"\n` +
      `• "Vamos a estudiar"\n` +
      `• "¿Qué tengo pendiente?"\n` +
      `• Envía enlaces para guardarlos\n\n` +
      `💡 Entiendo fechas, prioridades y materias automáticamente.`;

    await bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
  }

  /**
   * Verifica si el usuario está autenticado
   * Si no lo está, le da la bienvenida automáticamente
   */
  static async requireAuth(bot, msg, autoGreet = true) {
    const chatId = msg.chat.id;
    const profile = await supabaseService.getProfileByTelegramId(chatId);

    if (!profile && autoGreet) {
      // Saludo automático para usuarios nuevos
      await bot.sendMessage(
        chatId,
        `👋 ¡Hola! Soy *${config.BOT_NAME}*\n\n` +
        `Veo que es tu primera vez aquí. Para comenzar, necesito vincular tu Telegram con tu perfil de PomoSmart.\n\n` +
        `Envíame tu email o usa:\n` +
        `/vincular TU_EMAIL\n\n` +
        `_Ejemplo: /vincular leo@universidad.com_`,
        { parse_mode: 'Markdown' }
      );
      return null;
    }

    if (!profile && !autoGreet) {
      await bot.sendMessage(
        chatId,
        '⚠️ Primero necesitas vincular tu cuenta.\n\n' +
        'Usa /vincular TU_EMAIL para comenzar.',
        { parse_mode: 'Markdown' }
      );
      return null;
    }

    return profile;
  }

  /**
   * Saluda al usuario de forma personalizada cuando ya está vinculado
   */
  static async greetUser(bot, chatId, profile) {
    const gender = profile.gender || 'otro';
    const greeting = config.MOTIVATION[gender].greeting;
    const name = profile.user_name || 'amigo';

    await bot.sendMessage(
      chatId,
      `${greeting} Hola *${name}*\n\n` +
      `¿En qué puedo ayudarte hoy?\n\n` +
      `💡 Puedes:\n` +
      `• Ver tus tareas: /tareas\n` +
      `• Iniciar un Pomodoro: /pomo\n` +
      `• Ver estadísticas: /stats\n` +
      `• O simplemente escríbeme lo que necesitas`,
      { parse_mode: 'Markdown' }
    );
  }
}
