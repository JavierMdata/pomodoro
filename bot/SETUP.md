# 🚀 Guía Rápida de Configuración

## 1. Crear el Bot en Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot`
3. Sigue las instrucciones:
   - Nombre: `PomoSmart Assistant` (o el que prefieras)
   - Username: `TuNombrePomoBot` (debe terminar en "bot")
4. **Guarda el token** que te da (algo como: `123456789:ABCdefGHI...`)

## 2. Actualizar Base de Datos (Supabase)

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Agregar columnas para Telegram
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_telegram
ON profiles(telegram_chat_id);
```

## 3. Configurar Variables de Entorno

```bash
cd bot
cp .env.example .env
```

Edita `bot/.env` con tus valores:

```env
# Tu token de @BotFather
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# URL de Supabase (Project Settings > API)
SUPABASE_URL=https://tuproyecto.supabase.co

# Anon Key de Supabase (Project Settings > API)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OPCIONAL: API Key de Gemini (https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=AIzaSyC...
```

## 4. Instalar y Arrancar

```bash
cd bot
npm install
npm start
```

Deberías ver:
```
🤖 PomoSmart Bot iniciado...
✅ Sistema de notificaciones proactivas iniciado
✅ Bot listo y escuchando mensajes...
```

## 5. Vincular tu Perfil

1. Busca tu bot en Telegram (el username que creaste)
2. Envía `/start`
3. Envía `/vincular TU_EMAIL` (el email de tu perfil en PomoSmart)
4. ¡Listo! Ya estás conectado

## 6. Probar el Bot

Prueba estos comandos:

```
/tareas           → Ver tareas pendientes
/pomo            → Iniciar Pomodoro
/stats           → Ver estadísticas
```

O escribe en lenguaje natural:

```
"Agregar tarea de Física para mañana"
"¿Qué tengo pendiente?"
"Vamos a estudiar"
```

## 🔧 Troubleshooting

### El bot no responde
- Verifica que el token en `.env` es correcto
- Asegúrate que `npm start` está corriendo sin errores
- Revisa los logs en la consola

### No se puede vincular cuenta
- Verifica que ejecutaste el SQL en Supabase
- El email debe coincidir exactamente con el del perfil
- Usa el email completo (con @)

### "SUPABASE_ANON_KEY no está configurado"
- Copia la clave desde Supabase Dashboard
- Project Settings > API > anon/public key
- Pégala en `.env` sin espacios ni comillas

## 🚀 Producción (Opcional)

Para mantener el bot corriendo 24/7:

### Opción 1: PM2
```bash
npm install -g pm2
pm2 start server.js --name pomosmart-bot
pm2 save
pm2 startup
```

### Opción 2: Screen
```bash
screen -S pomosmart-bot
cd bot && npm start
# Presiona Ctrl+A, luego D para desconectar
```

### Opción 3: Deploy en Cloud
- Railway.app (gratis)
- Render.com (gratis)
- Fly.io (gratis)
- Heroku

---

**¿Necesitas ayuda?** Lee el `README.md` completo o abre un issue.
