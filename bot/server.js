import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';
import { AuthHandler } from './handlers/authHandler.js';
import { TaskHandler } from './handlers/taskHandler.js';
import { PomodoroHandler } from './handlers/pomodoroHandler.js';
import { NotificationHandler } from './handlers/notificationHandler.js';
import { aiService } from './services/aiService.js';
import { supabaseService } from './services/supabaseService.js';

// Validar configuración
if (!config.TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN no está configurado en .env');
  process.exit(1);
}

if (!config.SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY no está configurado en .env');
  process.exit(1);
}

// Crear instancia del bot
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 PomoSmart Bot iniciado...');

// ========== COMANDOS BÁSICOS ==========

bot.onText(/\/start/, async (msg) => {
  await AuthHandler.handleStart(bot, msg);
});

bot.onText(/\/ayuda/, async (msg) => {
  await AuthHandler.handleHelp(bot, msg);
});

bot.onText(/\/vincular(?:\s+(.+))?/, async (msg, match) => {
  const linkCode = match[1]?.trim();
  await AuthHandler.handleLink(bot, msg, linkCode);
});

bot.onText(/\/perfil/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  const gender = profile.gender || 'otro';
  const greeting = config.MOTIVATION[gender].greeting;

  const subjects = await supabaseService.getSubjectsByProfile(profile.id);
  const tasks = await supabaseService.getTasksByProfile(profile.id);
  const sessions = await supabaseService.getSessionsByProfile(profile.id, 7);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const totalMinutes = Math.floor(
    sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );

  let message = `${greeting}\n\n`;
  message += `👤 *${profile.user_name}*\n`;
  message += `📧 ${profile.email || 'No configurado'}\n\n`;
  message += `📊 *Estadísticas:*\n`;
  message += `📚 Materias: ${subjects.length}\n`;
  message += `📝 Tareas pendientes: ${pendingTasks.length}\n`;
  message += `⏱️ Minutos esta semana: ${totalMinutes}\n`;
  message += `🔥 Sesiones: ${sessions.length}`;

  await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// ========== GESTIÓN DE TAREAS ==========

bot.onText(/\/tareas/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await TaskHandler.handleListTasks(bot, msg, profile);
});

bot.onText(/\/examenes/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await TaskHandler.handleListExams(bot, msg, profile);
});

bot.onText(/\/materiales/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await TaskHandler.handleListMaterials(bot, msg, profile);
});

// ========== POMODORO ==========

bot.onText(/\/pomo/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await PomodoroHandler.handleStartPomodoro(bot, msg, profile);
});

bot.onText(/\/parar/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await PomodoroHandler.handleStopPomodoro(bot, msg, profile);
});

bot.onText(/\/stats/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  await PomodoroHandler.handleStats(bot, msg, profile);
});

// ========== PROCESAMIENTO DE LENGUAJE NATURAL ==========

bot.on('message', async (msg) => {
  // Ignorar comandos
  if (msg.text?.startsWith('/')) return;

  const profile = await supabaseService.getProfileByTelegramId(msg.chat.id);
  if (!profile) return;

  const messageText = msg.text || '';

  try {
    // Obtener contexto del usuario
    const subjects = await supabaseService.getSubjectsByProfile(profile.id);
    const tasks = await supabaseService.getTasksByProfile(profile.id);
    const exams = await supabaseService.getExamsByProfile(profile.id);

    const pendingTasks = tasks.filter(t => t.status !== 'completed');

    // Parsear intención con AI
    const parsed = await aiService.parseUserIntent(messageText, {
      subjects,
      pendingTasks: pendingTasks.length,
      upcomingExams: exams.length
    });

    console.log('Intent parsed:', parsed);

    // Manejar según la intención
    switch (parsed.intent) {
      case 'crear_tarea':
        await TaskHandler.handleCreateTask(bot, msg, profile, messageText);
        break;

      case 'crear_examen':
        await TaskHandler.handleCreateExam(bot, msg, profile, messageText);
        break;

      case 'listar_tareas':
        await TaskHandler.handleListTasks(bot, msg, profile);
        break;

      case 'iniciar_pomodoro':
        await PomodoroHandler.handleStartPomodoro(bot, msg, profile);
        break;

      case 'agregar_material':
        // Detectar si hay un enlace
        const urlMatch = messageText.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[1];
          const title = messageText.replace(url, '').trim() || 'Material web';

          // Encontrar materia o preguntar
          let subject = subjects[0]; // Por defecto primera materia

          if (subject) {
            const material = await supabaseService.createMaterial(
              subject.id,
              title,
              '',
              url,
              'link'
            );

            if (material) {
              await bot.sendMessage(
                msg.chat.id,
                `✅ Material guardado\n\n📎 ${title}\n📚 ${subject.name}`,
                { parse_mode: 'Markdown' }
              );
            }
          }
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '📚 Para guardar un material, envíame un enlace o escribe:\n"Material de [materia]: [título]"',
            { parse_mode: 'Markdown' }
          );
        }
        break;

      case 'consulta_general':
      default:
        // Respuesta conversacional
        const gender = profile.gender || 'otro';
        const responses = [
          `Mmm, ¿puedes ser más específico? Puedo ayudarte con tareas, exámenes o Pomodoros.`,
          `No estoy seguro de entenderte. Escribe /ayuda para ver qué puedo hacer.`,
          `¿Quieres ver tus tareas (/tareas), iniciar un Pomodoro (/pomo) o algo más?`
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        await bot.sendMessage(msg.chat.id, response);
        break;
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await bot.sendMessage(
      msg.chat.id,
      '❌ Ups, algo salió mal. Intenta de nuevo o usa /ayuda.'
    );
  }
});

// ========== CALLBACKS (BOTONES) ==========

bot.on('callback_query', async (query) => {
  const profile = await supabaseService.getProfileByTelegramId(query.message.chat.id);
  if (!profile) {
    await bot.answerCallbackQuery(query.id, {
      text: 'Primero vincula tu cuenta con /start',
      show_alert: true
    });
    return;
  }

  const data = query.data;

  try {
    if (data.startsWith('pomo_start:')) {
      await PomodoroHandler.handlePomodoroStart(bot, query, profile);
    } else if (data.startsWith('pomo_rate:')) {
      await PomodoroHandler.handleRatePomodoro(bot, query);
    } else if (data.startsWith('create_task_subject:')) {
      const [_, subjectId, ...textParts] = data.split(':');
      const text = textParts.join(':');
      await TaskHandler.handleCreateTask(bot, query.message, profile, text);
      await bot.answerCallbackQuery(query.id);
    } else if (data.startsWith('create_exam:')) {
      const [_, subjectId, examDate, examTime] = data.split(':');
      // Implementar creación de examen con subject seleccionado
      await bot.answerCallbackQuery(query.id, { text: 'Examen creado' });
    } else if (data === 'pomo_pause') {
      await bot.answerCallbackQuery(query.id, {
        text: 'Pausa no implementada aún',
        show_alert: true
      });
    } else if (data === 'pomo_stop') {
      await PomodoroHandler.handleStopPomodoro(bot, query.message, profile);
      await bot.answerCallbackQuery(query.id);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await bot.answerCallbackQuery(query.id, {
      text: 'Error al procesar',
      show_alert: true
    });
  }
});

// ========== SISTEMA DE NOTIFICACIONES ==========

NotificationHandler.init(bot);

// ========== MANEJO DE ERRORES ==========

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Deteniendo bot...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Bot listo y escuchando mensajes...');
console.log('📱 Escribe /start en Telegram para comenzar');
