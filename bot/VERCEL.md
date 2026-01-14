# 🚀 Desplegar en Vercel

## Configuración de Variables de Entorno

### Para UN solo bot:

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```env
# Bot Principal
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Supabase
SUPABASE_URL=https://gsmyzhzaywnwigklfxev.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini (Opcional)
GEMINI_API_KEY=AIzaSyC...
```

### Para MÚLTIPLES bots (Varios perfiles):

Si quieres tener un bot por perfil (ej: uno para Universidad, otro para Trabajo):

```env
# Bot 1 - Universidad
CHATBOT_1_TOKEN=123456789:ABCdefGHI_Universidad_Bot
CHATBOT_1_NAME=Universidad Bot
CHATBOT_1_PROFILE=universidad

# Bot 2 - Trabajo
CHATBOT_2_TOKEN=987654321:XYZabcDEF_Trabajo_Bot
CHATBOT_2_NAME=Trabajo Bot
CHATBOT_2_PROFILE=trabajo

# Bot 3 - Personal
CHATBOT_3_TOKEN=555666777:MNOpqrSTU_Personal_Bot
CHATBOT_3_NAME=Personal Bot
CHATBOT_3_PROFILE=personal

# Supabase (compartido)
SUPABASE_URL=https://gsmyzhzaywnwigklfxev.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...

# Gemini (compartido - opcional)
GEMINI_API_KEY=AIzaSyC...
```

## Estructura para Múltiples Bots

Si usas múltiples bots, actualiza `bot/config.js`:

```javascript
export const config = {
  // Obtener configuración de bots múltiples
  getBots: () => {
    const bots = [];

    // Buscar todos los CHATBOT_X_TOKEN en las variables de entorno
    for (let i = 1; i <= 10; i++) {
      const token = process.env[`CHATBOT_${i}_TOKEN`];
      if (token) {
        bots.push({
          id: `chatbot_${i}`,
          token,
          name: process.env[`CHATBOT_${i}_NAME`] || `Bot ${i}`,
          profile: process.env[`CHATBOT_${i}_PROFILE`] || null
        });
      }
    }

    // Si no hay bots múltiples, usar el token principal
    if (bots.length === 0 && process.env.TELEGRAM_BOT_TOKEN) {
      bots.push({
        id: 'main',
        token: process.env.TELEGRAM_BOT_TOKEN,
        name: 'PomoSmart Assistant',
        profile: null
      });
    }

    return bots;
  },

  // Configuración existente
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://gsmyzhzaywnwigklfxev.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  MOTIVATION: {
    // ... (sin cambios)
  }
};
```

Y actualizar `bot/server.js` para manejar múltiples bots:

```javascript
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';

const bots = config.getBots();

if (bots.length === 0) {
  console.error('❌ No se encontró ningún token de bot configurado');
  process.exit(1);
}

// Iniciar cada bot
bots.forEach(botConfig => {
  const bot = new TelegramBot(botConfig.token, { polling: true });

  console.log(`🤖 Iniciando ${botConfig.name}...`);

  // Registrar todos los handlers
  setupBot(bot, botConfig);
});

function setupBot(bot, botConfig) {
  // Todos tus handlers aquí (sin cambios)
  bot.onText(/\/start/, async (msg) => {
    // ...
  });

  // ...resto de handlers
}
```

## ⚙️ Configuración Simplificada (Recomendada)

**Para la mayoría de usuarios, usa UN solo bot:**

1. Ve a Vercel → Settings → Environment Variables
2. Agrega solo estas 3 variables:

```
TELEGRAM_BOT_TOKEN = (token de @BotFather)
SUPABASE_URL = https://gsmyzhzaywnwigklfxev.supabase.co
SUPABASE_ANON_KEY = (tu anon key de Supabase)
```

3. (Opcional) Agrega `GEMINI_API_KEY` para IA avanzada

## 📝 Nombres de Variables - Resumen Rápido

### Variables OBLIGATORIAS:

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `TELEGRAM_BOT_TOKEN` | Token del bot | @BotFather en Telegram |
| `SUPABASE_URL` | URL de tu proyecto | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | Public key | Supabase → Project Settings → API |

### Variables OPCIONALES:

| Variable | Descripción | Beneficio |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | API de Google Gemini | Lenguaje natural avanzado |

### Variables para MÚLTIPLES BOTS:

| Variable | Ejemplo | Uso |
|----------|---------|-----|
| `CHATBOT_1_TOKEN` | `123:ABCdef` | Token del bot 1 |
| `CHATBOT_1_NAME` | `Universidad Bot` | Nombre personalizado |
| `CHATBOT_1_PROFILE` | `universidad` | Perfil asociado |
| `CHATBOT_2_TOKEN` | `456:XYZabc` | Token del bot 2 |
| `CHATBOT_2_NAME` | `Trabajo Bot` | Nombre personalizado |
| `CHATBOT_2_PROFILE` | `trabajo` | Perfil asociado |

## 🔄 Despliegue

### Método 1: Desde Vercel Dashboard

1. Conecta tu repositorio GitHub
2. Selecciona la carpeta `bot`
3. Agrega las variables de entorno
4. Deploy

### Método 2: Vercel CLI

```bash
cd bot
vercel

# Agregar variables de entorno
vercel env add TELEGRAM_BOT_TOKEN
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

## ⚠️ IMPORTANTE para Vercel

**Vercel tiene limitaciones con long polling**. Para bots de Telegram en Vercel, es mejor usar webhooks:

1. Modifica `server.js` para usar webhooks en lugar de polling:

```javascript
// En lugar de polling
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
  webHook: {
    port: process.env.PORT || 3000
  }
});

// Configurar webhook
const url = process.env.VERCEL_URL || 'https://tu-dominio.vercel.app';
bot.setWebHook(`${url}/bot${config.TELEGRAM_BOT_TOKEN}`);
```

2. O mejor aún: **Usa Railway, Render o Fly.io** que soportan procesos largos.

## 🚀 Alternativas Recomendadas a Vercel

Para bots con polling (recomendado):

### Railway.app (⭐ Recomendado)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Variables en Railway:
- Mismo formato que Vercel
- Soporta polling sin problemas

### Render.com
1. Conecta tu repo
2. Tipo: Background Worker
3. Build: `npm install`
4. Start: `npm start`

### Fly.io
```bash
fly launch
fly secrets set TELEGRAM_BOT_TOKEN=tu_token
fly secrets set SUPABASE_URL=tu_url
fly secrets set SUPABASE_ANON_KEY=tu_key
fly deploy
```

## 📋 Checklist Final

- [ ] Token de @BotFather obtenido
- [ ] Variables de entorno configuradas
- [ ] SQL ejecutado en Supabase (columnas telegram_*)
- [ ] Bot desplegado
- [ ] Webhook configurado (si usas Vercel)
- [ ] Prueba con /start en Telegram
- [ ] Vinculación exitosa con /vincular

---

**Recomendación**: Si es tu primer despliegue, usa **Railway** o **Render** en lugar de Vercel. Son más adecuados para bots de Telegram con polling.
