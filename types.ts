
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

  // Security fields
  pin_hash?: string; // Hash del PIN (nunca guardar en texto plano)
  requires_pin: boolean; // Si requiere PIN para desbloquear
  biometric_enabled: boolean; // Si permite autenticación biométrica
  auto_lock_minutes?: number; // Minutos de inactividad antes de bloquear (null = no auto-lock)
  last_accessed_at?: string; // Última vez que se accedió al perfil
}

export type PeriodType = 'trimestre' | 'semestre' | 'año' | 'custom';

export interface SchoolPeriod {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  period_type?: PeriodType;
  total_weeks?: number;
  description?: string;
}

export interface PeriodProgress {
  current_week: number;
  total_weeks: number;
  weeks_remaining: number;
  progress_percentage: number;
}

export interface Subject {
  id: string;
  profile_id: string;
  school_period_id?: string | null;
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

export type WorkBlockType = 'study' | 'work' | 'break' | 'other';
export type WorkCategory = 'materia' | 'idioma' | 'trabajo' | 'gym' | 'proyecto' | 'otro';

export interface WorkSchedule {
  id: string;
  profile_id: string;
  day_of_week: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  start_time: string;
  end_time: string;
  block_type: WorkBlockType;
  category?: WorkCategory; // Categoría del bloque (materia, idioma, trabajo, gym, etc.)
  subject_id?: string; // Si es materia, vínculo a Subject
  description?: string;
  is_active: boolean;
}

export interface SubjectTimeAllocation {
  id: string;
  profile_id: string;
  subject_id: string;
  allocated_hours_per_week: number;
  priority_level: number; // 1-5
  auto_calculated: boolean;
  last_updated: string;
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
  book_id?: string; // NUEVO: Libro asociado a la sesión
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

// Timer activo persistente - sigue corriendo aunque cierres la app
export interface ActiveTimer {
  id: string;
  profile_id: string;
  mode: 'work' | 'short_break' | 'long_break';
  started_at: string; // Timestamp ISO de cuando empezó
  duration_seconds: number; // Duración total en segundos
  is_paused: boolean;
  paused_at?: string; // Timestamp de cuando se pausó
  elapsed_when_paused?: number; // Segundos transcurridos al pausar
  session_count: number;

  // Item seleccionado
  selected_item_type?: 'task' | 'exam' | 'material';
  selected_item_id?: string;
  selected_meta_id?: string; // Para exam_topic
  selected_subject_id?: string;
  selected_display_title?: string;
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
  | 'focus_journal'
  | 'book'; // NUEVO: Libros como nodos del grafo

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

// ================================================================
// SISTEMA DE GESTIÓN DE LIBROS Y LECTURA
// ================================================================

// Estado de lectura del libro
export type BookStatus = 'not_started' | 'reading' | 'paused' | 'completed' | 'abandoned';

// Géneros de libros
export type BookGenre = 'ficcion' | 'no_ficcion' | 'academico' | 'tecnico' | 'autoayuda' | 'biografia' | 'historia' | 'ciencia' | 'filosofia' | 'otro';

// Libro
export interface Book {
  id: string;
  profile_id: string;
  subject_id?: string; // Opcional: para libros académicos vinculados a una materia

  // Información del libro
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  genre?: BookGenre;
  language?: string;

  // Estructura del libro
  total_pages: number;
  total_chapters?: number;

  // Progreso de lectura
  current_page: number;
  current_chapter?: number;

  // Fechas importantes (calculadas automáticamente)
  start_date?: string;
  halfway_date?: string;
  completion_date?: string;
  last_read_date?: string;

  // Estado
  status: BookStatus;

  // Objetivos
  daily_pages_goal?: number;
  target_completion_date?: string;

  // Estadísticas (calculadas automáticamente)
  total_reading_time_minutes: number;
  pages_per_hour?: number;
  reading_streak_days: number;
  active_reading_days: number;

  // Metadata
  cover_url?: string;
  notes?: string;
  rating?: number; // 1-5 estrellas
  is_favorite: boolean;
  tags?: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Sesión de lectura
export interface BookReadingSession {
  id: string;
  book_id: string;
  profile_id: string;
  pomodoro_session_id?: string; // Vinculación con pomodoro

  // Progreso de la sesión
  start_page: number;
  end_page: number;
  pages_read: number; // Calculado automáticamente

  chapter_number?: number;
  chapter_name?: string;

  // Tiempo y duración
  session_date: string;
  duration_minutes: number;
  started_at?: string;
  completed_at?: string;

  // Evaluación de la sesión
  focus_rating?: number; // 1-5
  enjoyment_rating?: number; // 1-5
  comprehension_rating?: number; // 1-5

  // Notas
  session_notes?: string;
  quick_summary?: string;

  created_at: string;
}

// Citas y highlights del libro
export interface BookQuote {
  id: string;
  book_id: string;
  profile_id: string;

  // Contenido de la cita
  quote_text: string;
  page_number?: number;
  chapter_number?: number;
  chapter_name?: string;

  // Contexto
  context?: string;
  personal_note?: string;

  // Categorización
  category?: string;
  tags?: string[];
  is_favorite: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Tipo de objetivo de lectura
export type ReadingGoalType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Unidad del objetivo
export type ReadingGoalUnit = 'pages' | 'chapters' | 'books' | 'minutes';

// Objetivo de lectura
export interface ReadingGoal {
  id: string;
  profile_id: string;

  // Tipo de objetivo
  goal_type: ReadingGoalType;
  goal_unit: ReadingGoalUnit;
  target_amount: number;

  // Período
  start_date: string;
  end_date: string;

  // Progreso
  current_progress: number;
  progress_percentage: number;

  // Estado
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;

  // Metadata
  title?: string;
  description?: string;

  created_at: string;
  updated_at: string;
}

// Estadísticas de libros por perfil (vista)
export interface BookStatistics {
  profile_id: string;
  total_books: number;
  books_completed: number;
  books_in_progress: number;
  books_not_started: number;
  total_pages_read: number;
  total_reading_time_minutes: number;
  avg_reading_speed_pages_per_hour: number;
  avg_book_rating: number;
  longest_reading_streak: number;
}

// Progreso de lectura actual (vista)
export interface CurrentReadingProgress {
  book_id: string;
  profile_id: string;
  title: string;
  author?: string;
  total_pages: number;
  current_page: number;
  progress_percentage: number;
  pages_remaining: number;
  start_date?: string;
  last_read_date?: string;
  target_completion_date?: string;
  pages_per_hour?: number;
  estimated_minutes_remaining?: number;
  estimated_completion_date?: string;
  reading_streak_days: number;
  status: BookStatus;
}

// Actividad de lectura por mes (vista)
export interface ReadingActivityByMonth {
  profile_id: string;
  month: string;
  books_read: number;
  total_sessions: number;
  total_pages_read: number;
  total_minutes_read: number;
  avg_focus_rating: number;
  avg_enjoyment_rating: number;
}
