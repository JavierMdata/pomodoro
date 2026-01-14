import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Telegram Bot Token
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://gsmyzhzaywnwigklfxev.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

  // Google Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Configuración del bot
  BOT_USERNAME: 'PomoSmartBot',

  // Mensajes motivacionales por género
  MOTIVATION: {
    masculino: {
      greeting: '¡Qué onda rey! 👑',
      celebration: '¡Vamos carajo, una tarea menos! 💪',
      urgency: '⚠️ Ojo campeón, tienes examen pronto',
      focus: '¡Enfoque láser, papá! 🚀',
      done: '¡Grande! 💪',
      encouragement: '¡Tú puedes, rey!'
    },
    femenino: {
      greeting: '¡Hola reina! 👑',
      celebration: '¡Excelente trabajo! 💪',
      urgency: '⚠️ Ojo reina, tienes examen pronto',
      focus: '¡Tú puedes, crack! 🌟',
      done: '¡Increíble! ✨',
      encouragement: '¡Eres imparable!'
    },
    otro: {
      greeting: '¡Hola campeón! 👋',
      celebration: '¡Genial, una tarea menos! 🎉',
      urgency: '⚠️ Tienes un examen próximo',
      focus: '¡Vamos con todo! 💪',
      done: '¡Excelente! 🌟',
      encouragement: '¡Sigue así!'
    }
  }
};
