import { Subject, Exam, Task, ExamTopic } from '../types';

export interface StudySession {
  id: string;
  subject_id: string;
  exam_id?: string;
  topic_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  session_number: number; // Para repetición espaciada
  repetition_interval: number; // Días desde la última sesión
  study_technique: 'pomodoro' | 'revision' | 'practice' | 'deep-focus';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'skipped';
  ai_recommendation: string;
}

export interface StudyPlan {
  profile_id: string;
  generated_at: string;
  sessions: StudySession[];
  total_study_hours: number;
  subjects_coverage: Record<string, number>; // subject_id -> horas asignadas
  ai_strategy: string;
}

// Algoritmo de repetición espaciada (basado en SuperMemo SM-2)
export const getSpacedRepetitionIntervals = (sessionNumber: number): number => {
  // Intervalos en días: 1, 3, 7, 14, 30, 60, 120
  const intervals = [1, 3, 7, 14, 30, 60, 120];
  return intervals[Math.min(sessionNumber, intervals.length - 1)];
};

// Calcular prioridad basada en fecha del examen
export const calculatePriority = (daysUntilExam: number): 'urgent' | 'high' | 'medium' | 'low' => {
  if (daysUntilExam <= 3) return 'urgent';
  if (daysUntilExam <= 7) return 'high';
  if (daysUntilExam <= 14) return 'medium';
  return 'low';
};

// Generar prompt para Gemini AI
export const generateStudyPlanPrompt = (
  subjects: Subject[],
  exams: Exam[],
  topics: ExamTopic[],
  schedules: any[],
  currentDate: Date
): string => {
  const subjectsInfo = subjects.map(s => ({
    name: s.name,
    code: s.code,
    classroom: s.classroom,
    professor: s.professor,
    color: s.color
  }));

  const examsInfo = exams.map(e => {
    const subject = subjects.find(s => s.id === e.subject_id);
    const examTopics = topics.filter(t => t.exam_id === e.id);
    const daysUntil = Math.ceil((new Date(e.exam_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      subject: subject?.name,
      subjectCode: subject?.code,
      parcial: e.parcial_number,
      date: e.exam_date,
      daysUntil,
      topics: examTopics.map(t => ({ id: t.id, title: t.title, description: t.description })),
      topicCount: examTopics.length
    };
  });

  // Organizar horario por día y horas ocupadas
  const scheduleByDay = schedules.reduce((acc, sch) => {
    const subject = subjects.find(s => s.id === sch.subject_id);
    if (!acc[sch.day_of_week]) acc[sch.day_of_week] = [];
    acc[sch.day_of_week].push({
      subject: subject?.name,
      startTime: sch.start_time,
      endTime: sch.end_time,
      day: sch.day_of_week
    });
    return acc;
  }, {} as Record<number, any[]>);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const scheduleDescription = Object.entries(scheduleByDay).map(([day, classes]) => {
    const dayName = daysOfWeek[parseInt(day)];
    const classesList = classes.map(c => `${c.startTime}-${c.endTime}: ${c.subject}`).join(', ');
    return `${dayName}: ${classesList}`;
  }).join('\n');

  return `Eres un experto en planificación de estudios universitarios y técnicas de aprendizaje efectivo basadas en ciencia cognitiva.

IMPORTANTE: Debes generar un horario de estudio COMPLETO y DETALLADO que incluya:
- Hora EXACTA de cada sesión (formato HH:MM en 24h)
- Día de la semana específico (0-6, donde 0=Domingo)
- Distribución a lo largo de TODO el día (mañana, tarde, noche)
- MÚLTIPLES sesiones por día cuando sea necesario

CONTEXTO DEL ESTUDIANTE:
- Fecha actual: ${currentDate.toLocaleDateString('es-ES')}
- Día de la semana: ${daysOfWeek[currentDate.getDay()]}
- Materias: ${JSON.stringify(subjectsInfo, null, 2)}
- Exámenes próximos: ${JSON.stringify(examsInfo, null, 2)}

HORARIO DE CLASES (HORAS OCUPADAS - NO PROGRAMAR AQUÍ):
${scheduleDescription || 'Sin clases programadas'}

PRINCIPIOS CIENTÍFICOS A APLICAR:

1. **Repetición Espaciada (Spaced Repetition)**
   - Intervalos: 1, 3, 7, 14, 30 días
   - Basado en curva de olvido de Ebbinghaus
   - Cada tema DEBE tener mínimo 3-5 sesiones espaciadas

2. **Técnicas de Estudio Efectivas**
   - **Active Recall**: Recuperar información de memoria sin mirar notas
   - **Feynman Technique**: Explicar conceptos en términos simples
   - **Interleaving**: Mezclar diferentes temas en una sesión
   - **Chunking**: Dividir información en bloques manejables
   - **Pomodoro**: Sesiones enfocadas de 25-50 minutos

3. **Optimización del Tiempo**
   - **Horarios pico cognitivos**:
     * Mañana (8-11 AM): Tareas complejas y nuevas
     * Tarde (3-6 PM): Repaso y consolidación
     * Noche (7-9 PM): Repaso ligero
   - **NO programar sobre clases existentes**
   - **Distribuir uniformemente** a lo largo de la semana
   - **Incluir días de descanso** (mínimo 1 día libre por semana)

4. **Priorización por Urgencia**
   - Exámenes en <7 días: Sesiones diarias intensivas
   - Exámenes en 7-14 días: 3-4 sesiones por semana
   - Exámenes en >14 días: 2-3 sesiones por semana

5. **Prevención del Burnout**
   - Máximo 4 sesiones de estudio por día
   - Alternar materias difíciles con fáciles
   - Incluir descansos de 5-15 minutos
   - Un día completo de descanso por semana

TAREA:
Genera un plan de estudio COMPLETO Y DETALLADO que incluya:
- **Mínimo 3-5 sesiones por tema** usando repetición espaciada
- **Hora EXACTA** de cada sesión (formato 24h: "08:00", "14:30", etc.)
- **Día de la semana** específico (0=Domingo, 1=Lunes, ..., 6=Sábado)
- **Distribución inteligente**: mañanas para contenido nuevo, tardes para repaso
- **NO solapar con horario de clases**
- **Variedad de técnicas** según el objetivo de cada sesión
- **Descansos programados** entre sesiones

TÉCNICAS DISPONIBLES:
- "deep-focus": Primera exposición, contenido nuevo (40-50 min)
- "active-recall": Recuperación activa sin notas (25-30 min)
- "feynman": Explicar conceptos en términos simples (30 min)
- "interleaving": Mezclar múltiples temas relacionados (50 min)
- "practice": Ejercicios y problemas (30-40 min)
- "revision": Repaso de resúmenes y notas (20-25 min)

FORMATO DE RESPUESTA (JSON):
{
  "strategy": "Descripción de la estrategia completa considerando horario de clases y técnicas científicas (3-4 líneas)",
  "total_weekly_hours": 0,
  "rest_days": [0, 6],
  "recommendations": [
    {
      "exam_subject": "Nombre EXACTO de la materia",
      "exam_date": "YYYY-MM-DD",
      "priority": "urgent|high|medium|low",
      "topics": [
        {
          "topic": "Nombre del tema",
          "topic_id": "ID del tema si está disponible",
          "estimated_difficulty": "hard|medium|easy",
          "sessions": [
            {
              "session_number": 1,
              "day_of_week": 1,
              "date": "YYYY-MM-DD",
              "time": "09:00",
              "duration_minutes": 50,
              "technique": "deep-focus",
              "description": "Lectura comprensiva y mapeo conceptual del tema",
              "expected_outcome": "Comprensión general de conceptos principales"
            },
            {
              "session_number": 2,
              "day_of_week": 3,
              "date": "YYYY-MM-DD",
              "time": "15:30",
              "duration_minutes": 30,
              "technique": "active-recall",
              "description": "Practicar recuperación sin notas mediante flashcards",
              "expected_outcome": "Consolidar memoria a corto plazo"
            },
            {
              "session_number": 3,
              "day_of_week": 5,
              "date": "YYYY-MM-DD",
              "time": "16:00",
              "duration_minutes": 25,
              "technique": "revision",
              "description": "Repaso espaciado de resúmenes y notas",
              "expected_outcome": "Transferencia a memoria largo plazo"
            }
          ]
        }
      ]
    }
  ]
}

REGLAS CRÍTICAS:
1. TODOS los campos deben estar completos (no usar null o undefined)
2. "time" debe ser formato 24h: "08:00", "14:30", "19:00"
3. "day_of_week": 0-6 (0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb)
4. "date" debe ser fecha real calculada desde ${currentDate.toISOString().split('T')[0]}
5. NO programar en horarios de clase
6. Distribuir sesiones en diferentes horas del día
7. Respetar días de descanso (típicamente domingo y un día entre semana)

IMPORTANTE: Responde SOLO con el JSON válido, sin markdown, sin comentarios, sin texto adicional.`;
};

// Llamar a la API de Gemini
export const generateStudyPlanWithAI = async (
  subjects: Subject[],
  exams: Exam[],
  topics: ExamTopic[],
  schedules: any[],
  apiKey?: string
): Promise<StudyPlan | null> => {
  try {
    // Usar API key de variable de entorno si no se proporciona
    const geminiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('⚠️ No Gemini API key available, using basic plan');
      console.warn('💡 Configura VITE_GEMINI_API_KEY en Vercel o .env local');
      return null;
    }

    console.log('🔑 API Key detectada, generando plan con IA Gemini...');

    const currentDate = new Date();
    const prompt = generateStudyPlanPrompt(subjects, exams, topics, schedules, currentDate);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Error en API de Gemini');
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Extraer JSON de la respuesta (puede venir con markdown)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const aiPlan = JSON.parse(jsonMatch[0]);

    // Convertir respuesta de IA a formato de StudyPlan
    const sessions: StudySession[] = [];
    let totalHours = 0;
    const subjectsCoverage: Record<string, number> = {};

    aiPlan.recommendations.forEach((rec: any) => {
      const subject = subjects.find(s => s.name === rec.exam_subject || s.code === rec.exam_subject);
      if (!subject) {
        console.warn(`Subject not found: ${rec.exam_subject}`);
        return;
      }

      rec.topics.forEach((topicPlan: any) => {
        const topic = topics.find(t =>
          t.title === topicPlan.topic ||
          (topicPlan.topic_id && t.id === topicPlan.topic_id)
        );

        topicPlan.sessions.forEach((session: any) => {
          // Usar la fecha y hora específicas de la IA
          const scheduledDate = session.date || session.scheduled_date || new Date(currentDate).toISOString().split('T')[0];
          const scheduledTime = session.time || session.scheduled_time || '09:00';

          const daysUntilExam = Math.ceil(
            (new Date(rec.exam_date).getTime() - new Date(scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          const newSession: StudySession = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subject_id: subject.id,
            topic_id: topic?.id,
            scheduled_date: scheduledDate,
            scheduled_time: scheduledTime,
            duration_minutes: session.duration_minutes || 25,
            session_number: session.session_number || 1,
            repetition_interval: getSpacedRepetitionIntervals((session.session_number || 1) - 1),
            study_technique: session.technique || 'pomodoro',
            priority: calculatePriority(daysUntilExam),
            status: 'pending',
            ai_recommendation: session.description || session.expected_outcome || 'Sesión de estudio'
          };

          sessions.push(newSession);
          totalHours += (session.duration_minutes || 25) / 60;

          if (!subjectsCoverage[subject.id]) {
            subjectsCoverage[subject.id] = 0;
          }
          subjectsCoverage[subject.id] += (session.duration_minutes || 25) / 60;
        });
      });
    });

    return {
      profile_id: subjects[0]?.profile_id || '',
      generated_at: currentDate.toISOString(),
      sessions: sessions.sort((a, b) =>
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      ),
      total_study_hours: totalHours,
      subjects_coverage: subjectsCoverage,
      ai_strategy: aiPlan.strategy
    };

  } catch (error) {
    console.error('Error generando plan de estudio con IA:', error);
    return null;
  }
};

// Generar plan de estudio sin IA (fallback)
export const generateBasicStudyPlan = (
  subjects: Subject[],
  exams: Exam[],
  topics: ExamTopic[],
  schedules: any[]
): StudyPlan => {
  const currentDate = new Date();
  const sessions: StudySession[] = [];
  let totalHours = 0;
  const subjectsCoverage: Record<string, number> = {};

  // Horas disponibles por día (evitando clases)
  const availableTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'];

  // Ordenar exámenes por fecha
  const sortedExams = [...exams].sort((a, b) =>
    new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
  );

  let sessionCounter = 0;

  sortedExams.forEach(exam => {
    const subject = subjects.find(s => s.id === exam.subject_id);
    if (!subject) return;

    const examTopics = topics.filter(t => t.exam_id === exam.id);
    const daysUntilExam = Math.ceil(
      (new Date(exam.exam_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    examTopics.forEach((topic, topicIndex) => {
      // Generar 3 sesiones por tema usando repetición espaciada
      const techniques = [
        { type: 'deep-focus', duration: 50, desc: 'Lectura comprensiva y mapeo de conceptos principales' },
        { type: 'active-recall', duration: 30, desc: 'Recuperación activa con flashcards y preguntas' },
        { type: 'practice', duration: 30, desc: 'Ejercicios prácticos y consolidación' }
      ];

      for (let i = 0; i < 3; i++) {
        const interval = getSpacedRepetitionIntervals(i);
        const scheduledDate = new Date(currentDate);
        scheduledDate.setDate(scheduledDate.getDate() + topicIndex + interval);

        // No programar después del examen
        if (scheduledDate >= new Date(exam.exam_date)) continue;

        // Escoger hora disponible rotativamente
        const timeIndex = (sessionCounter + i) % availableTimes.length;
        const scheduledTime = availableTimes[timeIndex];

        const tech = techniques[i] || techniques[0];

        const session: StudySession = {
          id: `basic-${Date.now()}-${sessionCounter}-${Math.random().toString(36).substr(2, 9)}`,
          subject_id: subject.id,
          exam_id: exam.id,
          topic_id: topic.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_time: scheduledTime,
          duration_minutes: tech.duration,
          session_number: i + 1,
          repetition_interval: interval,
          study_technique: tech.type as any,
          priority: calculatePriority(daysUntilExam),
          status: 'pending',
          ai_recommendation: tech.desc
        };

        sessions.push(session);
        totalHours += session.duration_minutes / 60;

        if (!subjectsCoverage[subject.id]) {
          subjectsCoverage[subject.id] = 0;
        }
        subjectsCoverage[subject.id] += session.duration_minutes / 60;

        sessionCounter++;
      }
    });
  });

  return {
    profile_id: subjects[0]?.profile_id || '',
    generated_at: currentDate.toISOString(),
    sessions: sessions.sort((a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    ),
    total_study_hours: totalHours,
    subjects_coverage: subjectsCoverage,
    ai_strategy: 'Plan básico con repetición espaciada en intervalos de 1, 3 y 7 días'
  };
};
