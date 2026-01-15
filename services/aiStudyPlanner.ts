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
  currentDate: Date
): string => {
  const subjectsInfo = subjects.map(s => ({
    name: s.name,
    code: s.code,
    classroom: s.classroom,
    professor: s.professor
  }));

  const examsInfo = exams.map(e => {
    const subject = subjects.find(s => s.id === e.subject_id);
    const examTopics = topics.filter(t => t.exam_id === e.id);
    const daysUntil = Math.ceil((new Date(e.exam_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      subject: subject?.name,
      parcial: e.parcial_number,
      date: e.exam_date,
      daysUntil,
      topics: examTopics.map(t => t.title),
      topicCount: examTopics.length
    };
  });

  return `Eres un experto en planificación de estudios universitarios y técnicas de aprendizaje efectivo.

CONTEXTO DEL ESTUDIANTE:
- Fecha actual: ${currentDate.toLocaleDateString('es-ES')}
- Materias: ${JSON.stringify(subjectsInfo, null, 2)}
- Exámenes próximos: ${JSON.stringify(examsInfo, null, 2)}

PRINCIPIOS A APLICAR:
1. **Repetición Espaciada**: Programar sesiones de repaso en intervalos crecientes (1, 3, 7, 14, 30 días)
2. **Priorización**: Enfocarse primero en exámenes más cercanos
3. **Técnica Pomodoro**: Sesiones de 25-50 minutos con descansos
4. **Variedad**: Alternar entre materias para evitar fatiga mental
5. **Curva de Olvido**: Repasar dentro de las 24 horas de la primera exposición

TAREA:
Genera un plan de estudio óptimo que incluya:
- ¿Cuántas veces debe estudiar cada tema? (mínimo 3 sesiones por tema usando repetición espaciada)
- ¿En qué orden priorizar los temas?
- ¿Qué técnica de estudio usar en cada sesión? (primera lectura, resumen activo, práctica, repaso)
- ¿Cuánto tiempo dedicar a cada tema?
- ¿Cómo distribuir las sesiones para maximizar retención?

FORMATO DE RESPUESTA (JSON):
{
  "strategy": "Descripción breve de la estrategia (2-3 líneas)",
  "recommendations": [
    {
      "exam_subject": "Nombre de la materia",
      "exam_date": "YYYY-MM-DD",
      "topics": [
        {
          "topic": "Nombre del tema",
          "sessions": [
            {
              "session_number": 1,
              "days_from_now": 1,
              "duration_minutes": 50,
              "technique": "deep-focus",
              "description": "Primera lectura comprensiva del tema"
            },
            {
              "session_number": 2,
              "days_from_now": 3,
              "duration_minutes": 25,
              "technique": "revision",
              "description": "Repaso con resumen activo"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;
};

// Llamar a la API de Gemini
export const generateStudyPlanWithAI = async (
  subjects: Subject[],
  exams: Exam[],
  topics: ExamTopic[],
  apiKey: string
): Promise<StudyPlan | null> => {
  try {
    const currentDate = new Date();
    const prompt = generateStudyPlanPrompt(subjects, exams, topics, currentDate);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
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
      const subject = subjects.find(s => s.name === rec.exam_subject);
      if (!subject) return;

      rec.topics.forEach((topicPlan: any) => {
        const topic = topics.find(t => t.title === topicPlan.topic);

        topicPlan.sessions.forEach((session: any) => {
          const scheduledDate = new Date(currentDate);
          scheduledDate.setDate(scheduledDate.getDate() + session.days_from_now);

          const daysUntilExam = Math.ceil(
            (new Date(rec.exam_date).getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const newSession: StudySession = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subject_id: subject.id,
            topic_id: topic?.id,
            scheduled_date: scheduledDate.toISOString().split('T')[0],
            scheduled_time: session.session_number === 1 ? '09:00' : '15:00', // Mañana para primera sesión
            duration_minutes: session.duration_minutes,
            session_number: session.session_number,
            repetition_interval: getSpacedRepetitionIntervals(session.session_number - 1),
            study_technique: session.technique,
            priority: calculatePriority(daysUntilExam),
            status: 'pending',
            ai_recommendation: session.description
          };

          sessions.push(newSession);
          totalHours += session.duration_minutes / 60;

          if (!subjectsCoverage[subject.id]) {
            subjectsCoverage[subject.id] = 0;
          }
          subjectsCoverage[subject.id] += session.duration_minutes / 60;
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
  topics: ExamTopic[]
): StudyPlan => {
  const currentDate = new Date();
  const sessions: StudySession[] = [];
  let totalHours = 0;
  const subjectsCoverage: Record<string, number> = {};

  // Ordenar exámenes por fecha
  const sortedExams = [...exams].sort((a, b) =>
    new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
  );

  sortedExams.forEach(exam => {
    const subject = subjects.find(s => s.id === exam.subject_id);
    if (!subject) return;

    const examTopics = topics.filter(t => t.exam_id === exam.id);
    const daysUntilExam = Math.ceil(
      (new Date(exam.exam_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    examTopics.forEach((topic, topicIndex) => {
      // Generar 3 sesiones por tema usando repetición espaciada
      for (let i = 0; i < 3; i++) {
        const interval = getSpacedRepetitionIntervals(i);
        const scheduledDate = new Date(currentDate);
        scheduledDate.setDate(scheduledDate.getDate() + topicIndex * 2 + interval);

        // No programar después del examen
        if (scheduledDate >= new Date(exam.exam_date)) continue;

        const session: StudySession = {
          id: `basic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subject_id: subject.id,
          exam_id: exam.id,
          topic_id: topic.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_time: i === 0 ? '09:00' : (i === 1 ? '15:00' : '18:00'),
          duration_minutes: i === 0 ? 50 : 25,
          session_number: i + 1,
          repetition_interval: interval,
          study_technique: i === 0 ? 'deep-focus' : (i === 1 ? 'revision' : 'practice'),
          priority: calculatePriority(daysUntilExam),
          status: 'pending',
          ai_recommendation: i === 0
            ? 'Primera lectura y comprensión profunda'
            : (i === 1 ? 'Repaso activo con resúmenes' : 'Práctica y consolidación')
        };

        sessions.push(session);
        totalHours += session.duration_minutes / 60;

        if (!subjectsCoverage[subject.id]) {
          subjectsCoverage[subject.id] = 0;
        }
        subjectsCoverage[subject.id] += session.duration_minutes / 60;
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
