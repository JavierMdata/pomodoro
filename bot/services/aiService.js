import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

class AIService {
  constructor() {
    if (config.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Parsea un mensaje de usuario y extrae la intención y entidades
   */
  async parseUserIntent(message, context = {}) {
    if (!this.genAI) {
      return this.fallbackParser(message);
    }

    const prompt = `Eres un asistente inteligente de productividad. Analiza el siguiente mensaje del usuario y extrae la información estructurada.

Usuario dice: "${message}"

Contexto del usuario:
- Tiene materias: ${context.subjects?.map(s => s.name).join(', ') || 'ninguna'}
- Tareas pendientes: ${context.pendingTasks || 0}
- Exámenes próximos: ${context.upcomingExams || 0}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "intent": "crear_tarea" | "crear_examen" | "listar_tareas" | "iniciar_pomodoro" | "consulta_general" | "agregar_material",
  "entities": {
    "subject": "nombre de la materia (si se menciona)",
    "title": "título de la tarea/examen",
    "date": "fecha en formato YYYY-MM-DD (si se menciona)",
    "time": "hora en formato HH:MM (si se menciona)",
    "priority": "alta" | "media" | "baja",
    "description": "descripción adicional"
  },
  "confidence": 0.0-1.0
}

Ejemplos:
- "Tengo examen de Física el martes a las 10" → {"intent": "crear_examen", "entities": {"subject": "Física", "date": "próximo martes", "time": "10:00"}}
- "Agregar tarea de matemáticas para mañana" → {"intent": "crear_tarea", "entities": {"subject": "Matemáticas", "date": "mañana"}}
- "¿Qué tengo pendiente?" → {"intent": "listar_tareas", "entities": {}}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extraer JSON de la respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.fallbackParser(message);
    } catch (error) {
      console.error('Error parsing with AI:', error);
      return this.fallbackParser(message);
    }
  }

  /**
   * Parser simple basado en palabras clave (fallback)
   */
  fallbackParser(message) {
    const lowerMsg = message.toLowerCase();

    // Detectar intención
    let intent = 'consulta_general';

    if (lowerMsg.includes('tarea') || lowerMsg.includes('hacer') || lowerMsg.includes('pendiente')) {
      intent = lowerMsg.includes('?') || lowerMsg.includes('qué') || lowerMsg.includes('cuál')
        ? 'listar_tareas'
        : 'crear_tarea';
    } else if (lowerMsg.includes('examen') || lowerMsg.includes('prueba')) {
      intent = 'crear_examen';
    } else if (lowerMsg.includes('pomodoro') || lowerMsg.includes('estudiar') || lowerMsg.includes('concentr')) {
      intent = 'iniciar_pomodoro';
    } else if (lowerMsg.includes('material') || lowerMsg.includes('apuntes') || lowerMsg.includes('enlace') || lowerMsg.includes('link')) {
      intent = 'agregar_material';
    }

    // Extraer entidades básicas
    const entities = {};

    // Detectar prioridad
    if (lowerMsg.includes('urgente') || lowerMsg.includes('importante') || lowerMsg.includes('alta')) {
      entities.priority = 'alta';
    } else if (lowerMsg.includes('baja')) {
      entities.priority = 'baja';
    }

    // Detectar fechas relativas
    if (lowerMsg.includes('hoy')) {
      entities.date = new Date().toISOString().split('T')[0];
    } else if (lowerMsg.includes('mañana')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      entities.date = tomorrow.toISOString().split('T')[0];
    }

    return {
      intent,
      entities,
      confidence: 0.6
    };
  }

  /**
   * Genera una respuesta motivacional personalizada
   */
  async generateMotivationalResponse(profile, context) {
    const gender = profile.gender || 'otro';
    const motivation = config.MOTIVATION[gender];

    if (!this.genAI) {
      return motivation.encouragement;
    }

    const prompt = `Eres un mentor motivacional para ${profile.user_name}.
Género: ${gender}
Contexto: ${context}

Genera una frase motivacional corta (máximo 15 palabras) en español, con energía y personalidad.
Usa expresiones como "vamos", "tú puedes", según el género.
No uses emojis, solo texto.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return motivation.encouragement;
    }
  }

  /**
   * Genera sugerencias de qué estudiar
   */
  async generateStudySuggestion(profile, tasks, exams) {
    if (!this.genAI) {
      if (tasks.length > 0) {
        return `Tienes ${tasks.length} tareas pendientes. ¿Empezamos con "${tasks[0].title}"?`;
      }
      return 'Buen momento para revisar tus materiales de estudio 📚';
    }

    const urgentTasks = tasks.filter(t => t.priority === 'alta').slice(0, 3);
    const upcomingExams = exams.slice(0, 2);

    const prompt = `Eres un asistente de estudio para ${profile.user_name}.

Tareas urgentes: ${urgentTasks.map(t => `"${t.title}" (${t.subjects?.name})`).join(', ') || 'ninguna'}
Exámenes próximos: ${upcomingExams.map(e => `${e.title} (${e.subjects?.name}) - ${e.exam_date}`).join(', ') || 'ninguno'}

Genera UNA sugerencia concreta y motivadora de qué estudiar ahora (máximo 20 palabras).
Sé específico y menciona la tarea o materia concreta.
Tono: Amigable pero directo.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return tasks.length > 0
        ? `¿Qué tal si arrancamos con "${tasks[0].title}"?`
        : '¿Qué te gustaría estudiar hoy?';
    }
  }

  /**
   * Resume información de un enlace
   */
  async summarizeContent(content, maxWords = 100) {
    if (!this.genAI) {
      return 'Información guardada (AI no configurada para resumir)';
    }

    const prompt = `Resume el siguiente contenido en máximo ${maxWords} palabras, en español:

${content.substring(0, 2000)}

Resumen:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return 'Contenido guardado';
    }
  }
}

export const aiService = new AIService();
