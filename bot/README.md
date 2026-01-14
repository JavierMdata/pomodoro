# 🤖 PomoSmart Telegram Bot

Bot inteligente de Telegram para tu asistente de productividad PomoSmart. Gestiona tareas, exámenes, materiales de estudio y sesiones Pomodoro directamente desde Telegram con lenguaje natural.

## ✨ Características

### 🔐 Autenticación Inteligente
- **Multi-perfil**: Reconoce automáticamente quién le habla por ID de Telegram
- Vinculación simple con código de perfil
- Respuestas personalizadas según género del usuario

### 📝 Gestión Natural de Tareas
- **Lenguaje natural**: "Agregar tarea de Física para mañana"
- Detección automática de fechas relativas (hoy, mañana, viernes, etc.)
- Priorización automática (urgente, importante)
- Agrupación por materia

### 🎯 Recordatorios de Exámenes
- Agendado inteligente: "Tengo examen de Cálculo el martes a las 10"
- Alertas proactivas (3 días antes, 1 día antes)
- Recordatorio nocturno para exámenes de mañana

### ⏱️ Control de Pomodoro
- Inicio de sesiones desde Telegram
- Temporizador en vivo con actualizaciones
- Sincronización automática con Supabase
- Rating de concentración post-sesión
- Estadísticas en tiempo real

### 📚 Organización de Materiales
- Captura automática de enlaces
- Guardado con un mensaje
- Asociación inteligente a materias

### 💪 Proactividad y Motivación
- **Recordatorios matutinos** (9:00 AM): Tareas del día
- **Sugerencias de tarde** (2:00 PM): Qué estudiar ahora
- **Alertas de exámenes** (8:00 PM): Preparación de última hora
- **Motivación aleatoria**: Mensajes personalizados según tu progreso
- Respuestas con personalidad según género

## 🚀 Instalación

### 1. Requisitos
- Node.js 18+
- Cuenta de Telegram
- Proyecto Supabase activo
- (Opcional) API Key de Google Gemini

### 2. Configurar el Bot de Telegram

1. Habla con [@BotFather](https://t.me/BotFather) en Telegram
2. Crea un nuevo bot: `/newbot`
3. Sigue las instrucciones y guarda el **token** que te da
4. (Opcional) Configura foto de perfil: `/setuserpic`
5. (Opcional) Configura descripción: `/setdescription`

### 3. Instalar Dependencias

```bash
cd bot
npm install
```

### 4. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...  # Opcional
```

### 5. Actualizar Base de Datos

Agrega la columna `telegram_chat_id` a tu tabla `profiles` en Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN telegram_chat_id TEXT,
ADD COLUMN telegram_username TEXT;

CREATE INDEX idx_profiles_telegram ON profiles(telegram_chat_id);
```

### 6. Iniciar el Bot

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

Verás:
```
🤖 PomoSmart Bot iniciado...
✅ Sistema de notificaciones proactivas iniciado
✅ Bot listo y escuchando mensajes...
📱 Escribe /start en Telegram para comenzar
```

## 📱 Uso del Bot

### Vinculación Inicial

1. Busca tu bot en Telegram
2. Envía `/start`
3. El bot te pedirá tu código de vinculación
4. Usa `/vincular TU_EMAIL` o `/vincular TU_CODIGO`
5. ¡Listo! Ya estás conectado

### Comandos Disponibles

#### Básicos
- `/start` - Iniciar el bot y ver bienvenida
- `/ayuda` - Ver todos los comandos
- `/perfil` - Ver tu información y estadísticas
- `/vincular <código>` - Vincular tu cuenta

#### Tareas y Exámenes
- `/tareas` - Ver todas tus tareas pendientes
- `/examenes` - Ver exámenes próximos
- `/materiales` - Ver materiales guardados

#### Pomodoro
- `/pomo` - Iniciar sesión Pomodoro
- `/parar` - Detener sesión actual
- `/stats` - Ver estadísticas de la semana

### 💬 Lenguaje Natural

El bot entiende mensajes naturales. **Ejemplos reales**:

#### Crear Tareas
```
"Agregar tarea de Matemáticas para mañana"
"Tengo que hacer ejercicios de Física urgente"
"Pendiente: leer capítulo 5 de Historia"
```

#### Agendar Exámenes
```
"Tengo examen de Cálculo el martes a las 10"
"Examen de Química el 15/03"
"Prueba de Inglés mañana"
```

#### Guardar Materiales
```
"Guarda este enlace: https://ejemplo.com/apuntes"
"Material de Biología: Ciclo de Krebs"
```

#### Iniciar Pomodoro
```
"Vamos a estudiar"
"Quiero concentrarme"
"Arrancamos con Pomodoro"
```

#### Consultas
```
"¿Qué tengo pendiente?"
"¿Cuándo es mi próximo examen?"
"¿Cómo voy esta semana?"
```

## 🎨 Personalización por Género

El bot adapta su personalidad según el género configurado en tu perfil:

**Masculino**:
- "¡Qué onda rey! 👑"
- "¡Vamos carajo, una tarea menos! 💪"
- "¡Enfoque láser, papá! 🚀"

**Femenino**:
- "¡Hola reina! 👑"
- "¡Excelente trabajo! 💪"
- "¡Eres imparable! 🌟"

**Otro/Neutral**:
- "¡Hola campeón! 👋"
- "¡Genial, una tarea menos! 🎉"
- "¡Sigue así! 💪"

## 🔔 Sistema de Notificaciones Proactivas

### Recordatorio Matutino (9:00 AM)
- Tareas para hoy
- Exámenes próximos (≤3 días)
- Sugerencia de por dónde empezar

### Sugerencia de Tarde (2:00 PM)
- Solo si tienes <3 sesiones hoy
- Tareas urgentes pendientes
- Sugerencia personalizada con IA

### Alerta de Exámenes (8:00 PM)
- Exámenes de mañana
- Hora y ubicación
- Motivación de última hora

### Motivación Aleatoria (10 AM, 2 PM, 6 PM)
- Solo para usuarios activos (última semana)
- 30% de probabilidad (no molesta)
- Mensaje generado por IA según tu contexto

## 🧠 Inteligencia Artificial

Si configuras `GEMINI_API_KEY`, el bot usará Gemini para:

- **Parseo avanzado** de intenciones en lenguaje natural
- **Sugerencias inteligentes** de qué estudiar
- **Mensajes motivacionales** personalizados
- **Detección automática** de materias, fechas y prioridades

Sin API Key, el bot usa parsers basados en palabras clave (funcional pero menos preciso).

## 🏗️ Arquitectura

```
bot/
├── server.js              # Servidor principal
├── config.js              # Configuración y constantes
├── package.json           # Dependencias
├── handlers/              # Manejadores de comandos
│   ├── authHandler.js     # Autenticación y vinculación
│   ├── taskHandler.js     # Tareas, exámenes, materiales
│   ├── pomodoroHandler.js # Control de Pomodoro
│   └── notificationHandler.js # Notificaciones proactivas
├── services/              # Servicios externos
│   ├── supabaseService.js # Interacción con Supabase
│   └── aiService.js       # Procesamiento con Gemini
└── utils/                 # Utilidades
    └── dateUtils.js       # Parseo y formato de fechas
```

## 🔧 Desarrollo

### Agregar Nuevo Comando

1. Edita `server.js`:
```javascript
bot.onText(/\/micomando/, async (msg) => {
  const profile = await AuthHandler.requireAuth(bot, msg);
  if (!profile) return;

  // Tu lógica aquí
  await bot.sendMessage(msg.chat.id, 'Respuesta');
});
```

### Agregar Nueva Intención NLP

1. Edita `services/aiService.js`:
```javascript
// En parseUserIntent, agrega nueva intención al prompt
"intent": "crear_tarea" | "tu_nueva_intencion"
```

2. Maneja la intención en `server.js`:
```javascript
case 'tu_nueva_intencion':
  // Tu lógica
  break;
```

### Agregar Notificación Programada

1. Edita `handlers/notificationHandler.js`:
```javascript
// En init()
cron.schedule('0 15 * * *', () => {
  this.tuNuevaNotificacion();
});
```

## 📊 Monitoreo

Los logs del bot muestran:
- Mensajes recibidos y procesados
- Intenciones detectadas por la IA
- Errores y excepciones
- Estado de notificaciones

```bash
# Ver logs en tiempo real
npm start
```

## 🐛 Troubleshooting

### "Error: TELEGRAM_BOT_TOKEN no está configurado"
- Verifica que `.env` existe y tiene el token
- El token debe ser de @BotFather

### "Error al vincular cuenta"
- Verifica que la columna `telegram_chat_id` existe en `profiles`
- Usa el email exacto o ID del perfil

### "Bot no responde a mensajes"
- Revisa que el polling está activo (logs)
- Verifica que el perfil está vinculado (`/perfil`)
- Checa los logs para ver errores

### "Notificaciones no llegan"
- El bot debe estar corriendo 24/7
- Usa un servicio como PM2 o Docker
- Verifica zonas horarias (cron usa UTC)

## 🚀 Despliegue en Producción

### Opción 1: VPS con PM2

```bash
npm install -g pm2
pm2 start server.js --name pomosmart-bot
pm2 save
pm2 startup
```

### Opción 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]
```

```bash
docker build -t pomosmart-bot .
docker run -d --name bot --env-file .env pomosmart-bot
```

### Opción 3: Railway / Render / Fly.io

1. Conecta tu repositorio
2. Configura variables de entorno
3. Deploy automático

## 📝 TODO / Mejoras Futuras

- [ ] Comando para completar tareas
- [ ] Búsqueda de materiales
- [ ] Resúmenes con IA de enlaces
- [ ] Modo pausar Pomodoro
- [ ] Gráficas de estadísticas
- [ ] Integración con calendario
- [ ] Comandos inline (@bot comando)
- [ ] Web dashboard para configuración

## 📄 Licencia

MIT

## 🤝 Contribuciones

¡Contribuciones bienvenidas! Abre un issue o PR.

---

**Hecho con ❤️ para PomoSmart Productivity**
