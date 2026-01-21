
export type ProfileType = 'universidad' | 'trabajo' | 'personal' | 'otro';
export type Gender = 'masculino' | 'femenino' | 'otro';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  user_name: string;
  gender: Gender;
  type: ProfileType;
  color: string;
  icon: string;
}

export interface SchoolPeriod {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  profile_id: string;
  school_period_id: string;
  name: string;
  color: string;
  professor_name?: string;
  classroom?: string;
  start_date?: string;
  end_date?: string;
  code?: string;
  icon?: string;
}

export interface ClassSchedule {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'late';

export interface Task {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: Priority;
  status: TaskStatus;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  alert_days_before: number;
}

export interface Exam {
  id: string;
  subject_id: string;
  name: string;
  exam_date: string;
  status: 'upcoming' | 'completed' | 'missed';
  duration_minutes: number;
  weight_percentage: number;
  alert_days_before: number;
}

export interface ExamTopic {
  id: string;
  exam_id: string;
  title: string;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export type MaterialType = 'libro' | 'articulo' | 'video' | 'curso' | 'documento' | 'otro';
export interface Material {
  id: string;
  profile_id: string;
  subject_id: string; // Vínculo obligatorio
  title: string;
  type: MaterialType;
  total_units: number;
  completed_units: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

export interface PomodoroSettings {
  profile_id: string;
  work_duration: number;
  short_break: number;
  long_break: number;
  poms_before_long: number;
  auto_start_breaks: boolean;
}

export type Mood = 'energized' | 'calm' | 'focused' | 'frustrated' | 'curious' | 'proud' | 'overwhelmed' | 'playful' | 'determined';

export interface PomodoroSession {
  id: string;
  profile_id: string;
  task_id?: string;
  exam_topic_id?: string;
  material_id?: string;
  session_type: 'work' | 'short_break' | 'long_break';
  planned_duration_minutes: number;
  duration_seconds: number;
  status: 'completed' | 'interrupted';
  focus_rating?: number;
  mood?: Mood; // NUEVO: Estado emocional durante la sesión
  quick_notes?: string; // NUEVO: Notas rápidas post-sesión
  started_at: string;
  completed_at: string;
}

export interface Alert {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  priority: Priority;
  is_read: boolean;
  created_at: string;
}

// ================================================================
// SEGUNDO CEREBRO INTEGRAL - Nuevos Tipos
// ================================================================

// Tipos de bloques de contenido (estilo Notion)
export type BlockType =
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'checklist'
  | 'bullet_list'
  | 'numbered_list'
  | 'image'
  | 'code'
  | 'quote'
  | 'divider'
  | 'database'
  | 'gallery'
  | 'kanban'
  | 'callout';

// Tipos de entidades que pueden ser nodos en el grafo
export type EntityType =
  | 'content_block'
  | 'task'
  | 'subject'
  | 'exam'
  | 'exam_topic'
  | 'material'
  | 'focus_journal';

// Referencia a una entidad (para enlaces)
export interface EntityRef {
  type: EntityType;
  id: string;
}

// Bloque de contenido enriquecido (estilo Notion)
export interface ContentBlock {
  id: string;
  profile_id: string;

  // Relaciones opcionales
  task_id?: string;
  subject_id?: string;
  exam_id?: string;
  exam_topic_id?: string;
  material_id?: string;

  // Jerarquía
  parent_block_id?: string;
  position: number;

  // Tipo y contenido
  block_type: BlockType;
  content: Record<string, any>; // JSON estructurado

  // Metadata
  title?: string;
  icon?: string;
  cover_image?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Enlace bidireccional tipo Obsidian [[]]
export interface NoteLink {
  id: string;
  profile_id: string;

  // Source: de dónde sale el enlace
  source_type: EntityType;
  source_id: string;

  // Target: hacia dónde apunta
  target_type: EntityType;
  target_id: string;

  // Metadata
  link_text?: string; // Texto del [[enlace]]
  context?: string; // Contexto donde apareció

  // Peso (se incrementa con menciones)
  weight: number;

  // Timestamps
  created_at: string;
  last_referenced_at: string;
}

// Journal de enfoque (filosofía "Amar el Proceso")
export interface FocusJournal {
  id: string;
  profile_id: string;

  // Relaciones opcionales
  session_id?: string;
  subject_id?: string;
  task_id?: string;
  exam_topic_id?: string;
  material_id?: string;

  // Contenido
  title: string;
  entry: string; // Reflexión principal

  // Preguntas guiadas
  guided_questions?: {
    what_loved?: string; // ¿Qué te apasionó?
    what_learned?: string; // ¿Qué aprendiste?
    what_struggled?: string; // ¿Con qué luchaste?
    next_steps?: string; // ¿Próximos pasos?
  };

  // Estado emocional
  mood?: Mood;
  energy_level?: number; // 1-5
  flow_state_rating?: number; // 1-5 (qué tan "en la zona" estaba)

  // Tags personalizados
  tags?: string[];

  // Metadata
  journal_date: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Nodo del grafo de conocimiento (vista materializada)
export interface KnowledgeNode {
  node_type: EntityType;
  node_id: string;
  profile_id: string;
  title: string;
  color: string;
  icon: string;
  total_time_seconds: number;
  session_count: number;
  avg_focus_rating: number;
  node_size: number; // Tamaño calculado para visualización
}

// Conexión del grafo (para visualización)
export interface GraphConnection {
  link_id: string;
  connected_type: EntityType;
  connected_id: string;
  link_weight: number;
  direction: 'outgoing' | 'incoming';
}

// Datos completos del grafo (para React Force Graph)
export interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    type: EntityType;
    color: string;
    size: number;
    icon?: string;
    metadata?: any;
  }>;
  links: Array<{
    source: string;
    target: string;
    weight: number;
    color?: string;
  }>;
}
