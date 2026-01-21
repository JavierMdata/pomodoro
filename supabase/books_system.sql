-- ============================================================================
-- POMOSMART - SISTEMA DE GESTIÓN DE LIBROS Y LECTURA
-- ============================================================================
-- Creado: 2026-01-21
-- Descripción: Sistema completo de tracking de lectura con integración a pomodoros
-- Características:
--   ✓ Seguimiento de progreso de lectura (páginas, capítulos)
--   ✓ Cálculo automático de velocidad de lectura
--   ✓ Sesiones de lectura detalladas
--   ✓ Citas y highlights favoritos
--   ✓ Integración con pomodoros
--   ✓ Estadísticas y gráficos de evolución
--   ✓ Relación con materias académicas
--   ✓ Sistema de objetivos de lectura
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA 1: books (Libros)
-- ----------------------------------------------------------------------------
-- Almacena información principal de cada libro
CREATE TABLE IF NOT EXISTS books (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL, -- Opcional: para libros académicos

  -- Información del libro
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT, -- ISBN-10 o ISBN-13
  publisher TEXT, -- Editorial
  publication_year INTEGER,
  genre TEXT, -- Ficción, No Ficción, Académico, Técnico, etc.
  language TEXT DEFAULT 'es',

  -- Estructura del libro
  total_pages INTEGER NOT NULL CHECK (total_pages > 0),
  total_chapters INTEGER CHECK (total_chapters > 0),

  -- Progreso de lectura
  current_page INTEGER DEFAULT 0 CHECK (current_page >= 0 AND current_page <= total_pages),
  current_chapter INTEGER DEFAULT 0 CHECK (current_chapter >= 0),

  -- Fechas importantes (calculadas automáticamente)
  start_date DATE, -- Fecha cuando empezó a leer
  halfway_date DATE, -- Fecha cuando llegó a la mitad
  completion_date DATE, -- Fecha cuando terminó
  last_read_date DATE, -- Última fecha de lectura

  -- Estado de lectura
  status TEXT DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'reading', 'paused', 'completed', 'abandoned')
  ),

  -- Objetivos
  daily_pages_goal INTEGER, -- Meta diaria de páginas
  target_completion_date DATE, -- Fecha objetivo para terminar

  -- Estadísticas (calculadas con triggers)
  total_reading_time_minutes INTEGER DEFAULT 0, -- Tiempo total dedicado
  pages_per_hour NUMERIC(5,2), -- Velocidad de lectura calculada
  reading_streak_days INTEGER DEFAULT 0, -- Días consecutivos leyendo
  active_reading_days INTEGER DEFAULT 0, -- Total de días que ha leído

  -- Metadata
  cover_url TEXT, -- URL de portada del libro
  notes TEXT, -- Notas generales del libro
  rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- Calificación personal 1-5 estrellas
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- Etiquetas personalizadas

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_halfway_dates CHECK (
    halfway_date IS NULL OR
    (start_date IS NOT NULL AND halfway_date >= start_date)
  ),
  CONSTRAINT valid_completion_dates CHECK (
    completion_date IS NULL OR
    (start_date IS NOT NULL AND completion_date >= start_date)
  )
);

-- Índices para búsqueda rápida
CREATE INDEX idx_books_profile ON books(profile_id);
CREATE INDEX idx_books_subject ON books(subject_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_last_read ON books(last_read_date DESC);
CREATE INDEX idx_books_tags ON books USING GIN(tags);

COMMENT ON TABLE books IS 'Catálogo personal de libros con tracking de progreso';
COMMENT ON COLUMN books.pages_per_hour IS 'Velocidad de lectura calculada automáticamente basada en sesiones';
COMMENT ON COLUMN books.reading_streak_days IS 'Días consecutivos con al menos una sesión de lectura';

-- ----------------------------------------------------------------------------
-- TABLA 2: book_reading_sessions (Sesiones de Lectura)
-- ----------------------------------------------------------------------------
-- Registra cada sesión de lectura con detalle de páginas/capítulos leídos
CREATE TABLE IF NOT EXISTS book_reading_sessions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pomodoro_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL, -- Vinculación con pomodoro

  -- Progreso de la sesión
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL CHECK (end_page >= start_page),
  pages_read INTEGER GENERATED ALWAYS AS (end_page - start_page) STORED,

  chapter_number INTEGER, -- Capítulo que leyó
  chapter_name TEXT, -- Nombre del capítulo

  -- Tiempo y duración
  session_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Evaluación de la sesión
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5), -- Qué tan enfocado estuvo
  enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 5), -- Qué tanto disfrutó
  comprehension_rating INTEGER CHECK (comprehension_rating BETWEEN 1 AND 5), -- Qué tanto entendió

  -- Notas de la sesión
  session_notes TEXT, -- Reflexiones de la sesión
  quick_summary TEXT, -- Resumen breve de lo leído

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_session_times CHECK (
    completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
  )
);

-- Índices
CREATE INDEX idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_profile ON book_reading_sessions(profile_id);
CREATE INDEX idx_reading_sessions_date ON book_reading_sessions(session_date DESC);
CREATE INDEX idx_reading_sessions_pomodoro ON book_reading_sessions(pomodoro_session_id);

COMMENT ON TABLE book_reading_sessions IS 'Registro detallado de cada sesión de lectura';
COMMENT ON COLUMN book_reading_sessions.pages_read IS 'Calculado automáticamente como (end_page - start_page)';

-- ----------------------------------------------------------------------------
-- TABLA 3: book_quotes (Citas y Highlights del Libro)
-- ----------------------------------------------------------------------------
-- Almacena citas, frases memorables y highlights de los libros
CREATE TABLE IF NOT EXISTS book_quotes (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contenido de la cita
  quote_text TEXT NOT NULL,
  page_number INTEGER,
  chapter_number INTEGER,
  chapter_name TEXT,

  -- Contexto
  context TEXT, -- Contexto donde apareció la cita
  personal_note TEXT, -- Por qué te gustó o qué significa para ti

  -- Categorización
  category TEXT, -- motivacional, técnica, filosófica, etc.
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_book_quotes_book ON book_quotes(book_id);
CREATE INDEX idx_book_quotes_profile ON book_quotes(profile_id);
CREATE INDEX idx_book_quotes_favorite ON book_quotes(is_favorite);
CREATE INDEX idx_book_quotes_tags ON book_quotes USING GIN(tags);

COMMENT ON TABLE book_quotes IS 'Colección de citas favoritas y highlights de libros';

-- ----------------------------------------------------------------------------
-- TABLA 4: reading_goals (Objetivos de Lectura)
-- ----------------------------------------------------------------------------
-- Define metas personales de lectura (diarias, semanales, mensuales, anuales)
CREATE TABLE IF NOT EXISTS reading_goals (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tipo de objetivo
  goal_type TEXT NOT NULL CHECK (
    goal_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')
  ),

  -- Definición del objetivo
  goal_unit TEXT NOT NULL CHECK (
    goal_unit IN ('pages', 'chapters', 'books', 'minutes')
  ),
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),

  -- Período
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),

  -- Progreso (calculado)
  current_progress INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN target_amount > 0 THEN (current_progress::NUMERIC / target_amount * 100)
      ELSE 0
    END
  ) STORED,

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Metadata
  title TEXT, -- Nombre descriptivo del objetivo
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reading_goals_profile ON reading_goals(profile_id);
CREATE INDEX idx_reading_goals_active ON reading_goals(is_active);
CREATE INDEX idx_reading_goals_dates ON reading_goals(start_date, end_date);

COMMENT ON TABLE reading_goals IS 'Objetivos personales de lectura con tracking de progreso';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER 1: Actualizar updated_at automáticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at_trigger
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

CREATE TRIGGER book_quotes_updated_at_trigger
  BEFORE UPDATE ON book_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

CREATE TRIGGER reading_goals_updated_at_trigger
  BEFORE UPDATE ON reading_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

-- ----------------------------------------------------------------------------
-- TRIGGER 2: Actualizar progreso del libro automáticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_book_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_book_pages INTEGER;
  v_halfway_page INTEGER;
  v_book_status TEXT;
  v_book_start_date DATE;
BEGIN
  -- Obtener información del libro
  SELECT total_pages, status, start_date
  INTO v_book_pages, v_book_status, v_book_start_date
  FROM books
  WHERE id = NEW.book_id;

  v_halfway_page := v_book_pages / 2;

  -- Actualizar el libro con el nuevo progreso
  UPDATE books
  SET
    -- Actualizar página actual (si es mayor que la actual)
    current_page = GREATEST(current_page, NEW.end_page),

    -- Actualizar capítulo actual
    current_chapter = COALESCE(NEW.chapter_number, current_chapter),

    -- Actualizar última fecha de lectura
    last_read_date = NEW.session_date,

    -- Si no tiene start_date, establecerlo
    start_date = COALESCE(start_date, NEW.session_date),

    -- Si llegó a la mitad, registrar fecha
    halfway_date = CASE
      WHEN halfway_date IS NULL AND NEW.end_page >= v_halfway_page
      THEN NEW.session_date
      ELSE halfway_date
    END,

    -- Si completó el libro, registrar fecha
    completion_date = CASE
      WHEN NEW.end_page >= v_book_pages THEN NEW.session_date
      ELSE completion_date
    END,

    -- Actualizar estado automáticamente
    status = CASE
      WHEN NEW.end_page >= v_book_pages THEN 'completed'
      WHEN v_book_status = 'not_started' THEN 'reading'
      ELSE status
    END,

    -- Sumar tiempo de lectura
    total_reading_time_minutes = total_reading_time_minutes + NEW.duration_minutes,

    updated_at = NOW()
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_progress_trigger
  AFTER INSERT ON book_reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_book_progress();

COMMENT ON FUNCTION update_book_progress IS 'Actualiza automáticamente el progreso del libro después de cada sesión de lectura';

-- ----------------------------------------------------------------------------
-- TRIGGER 3: Calcular velocidad de lectura
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_reading_speed()
RETURNS TRIGGER AS $$
DECLARE
  v_total_pages INTEGER;
  v_total_minutes INTEGER;
  v_pages_per_hour NUMERIC(5,2);
BEGIN
  -- Calcular páginas por hora basado en todas las sesiones
  SELECT
    COALESCE(SUM(pages_read), 0),
    COALESCE(SUM(duration_minutes), 0)
  INTO v_total_pages, v_total_minutes
  FROM book_reading_sessions
  WHERE book_id = NEW.book_id;

  -- Calcular velocidad (páginas por hora)
  IF v_total_minutes > 0 THEN
    v_pages_per_hour := (v_total_pages::NUMERIC / v_total_minutes) * 60;

    UPDATE books
    SET pages_per_hour = v_pages_per_hour
    WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_reading_speed_trigger
  AFTER INSERT ON book_reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_reading_speed();

COMMENT ON FUNCTION calculate_reading_speed IS 'Calcula la velocidad de lectura en páginas por hora';

-- ----------------------------------------------------------------------------
-- TRIGGER 4: Actualizar racha de lectura
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_reading_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_read_date DATE;
  v_current_streak INTEGER;
  v_active_days INTEGER;
BEGIN
  -- Obtener última fecha de lectura y racha actual
  SELECT last_read_date, reading_streak_days, active_reading_days
  INTO v_last_read_date, v_current_streak, v_active_days
  FROM books
  WHERE id = NEW.book_id;

  -- Si es el primer día o si leyó ayer, incrementar racha
  IF v_last_read_date IS NULL THEN
    v_current_streak := 1;
  ELSIF NEW.session_date = v_last_read_date + INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSIF NEW.session_date = v_last_read_date THEN
    -- Mismo día, no cambiar racha
    v_current_streak := v_current_streak;
  ELSE
    -- Se rompió la racha
    v_current_streak := 1;
  END IF;

  -- Contar días activos únicos
  SELECT COUNT(DISTINCT session_date)
  INTO v_active_days
  FROM book_reading_sessions
  WHERE book_id = NEW.book_id;

  UPDATE books
  SET
    reading_streak_days = v_current_streak,
    active_reading_days = v_active_days
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reading_streak_trigger
  AFTER INSERT ON book_reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_streak();

COMMENT ON FUNCTION update_reading_streak IS 'Actualiza la racha de días consecutivos leyendo el libro';

-- ============================================================================
-- VISTAS Y FUNCIONES DE CONSULTA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VISTA 1: Estadísticas de libros por perfil
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW book_statistics_by_profile AS
SELECT
  b.profile_id,
  COUNT(*) AS total_books,
  COUNT(*) FILTER (WHERE b.status = 'completed') AS books_completed,
  COUNT(*) FILTER (WHERE b.status = 'reading') AS books_in_progress,
  COUNT(*) FILTER (WHERE b.status = 'not_started') AS books_not_started,
  COALESCE(SUM(b.total_pages) FILTER (WHERE b.status = 'completed'), 0) AS total_pages_read,
  COALESCE(SUM(b.total_reading_time_minutes), 0) AS total_reading_time_minutes,
  ROUND(AVG(b.pages_per_hour), 2) AS avg_reading_speed_pages_per_hour,
  ROUND(AVG(b.rating) FILTER (WHERE b.rating IS NOT NULL), 2) AS avg_book_rating,
  MAX(b.reading_streak_days) AS longest_reading_streak
FROM books b
GROUP BY b.profile_id;

COMMENT ON VIEW book_statistics_by_profile IS 'Estadísticas agregadas de lectura por perfil';

-- ----------------------------------------------------------------------------
-- VISTA 2: Progreso de lectura actual
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW current_reading_progress AS
SELECT
  b.id AS book_id,
  b.profile_id,
  b.title,
  b.author,
  b.total_pages,
  b.current_page,
  ROUND((b.current_page::NUMERIC / b.total_pages * 100), 2) AS progress_percentage,
  b.total_pages - b.current_page AS pages_remaining,
  b.start_date,
  b.last_read_date,
  b.target_completion_date,
  b.pages_per_hour,
  -- Estimación de tiempo restante
  CASE
    WHEN b.pages_per_hour > 0 THEN
      ROUND(((b.total_pages - b.current_page)::NUMERIC / b.pages_per_hour) * 60)
    ELSE NULL
  END AS estimated_minutes_remaining,
  -- Estimación de fecha de finalización
  CASE
    WHEN b.pages_per_hour > 0 AND b.daily_pages_goal > 0 THEN
      b.last_read_date + ((b.total_pages - b.current_page)::NUMERIC / b.daily_pages_goal)::INTEGER
    ELSE NULL
  END AS estimated_completion_date,
  b.reading_streak_days,
  b.status
FROM books b
WHERE b.status IN ('reading', 'paused');

COMMENT ON VIEW current_reading_progress IS 'Vista del progreso actual de libros en lectura con estimaciones';

-- ----------------------------------------------------------------------------
-- VISTA 3: Actividad de lectura por mes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW reading_activity_by_month AS
SELECT
  b.profile_id,
  DATE_TRUNC('month', brs.session_date) AS month,
  COUNT(DISTINCT brs.book_id) AS books_read,
  COUNT(brs.id) AS total_sessions,
  SUM(brs.pages_read) AS total_pages_read,
  SUM(brs.duration_minutes) AS total_minutes_read,
  ROUND(AVG(brs.focus_rating), 2) AS avg_focus_rating,
  ROUND(AVG(brs.enjoyment_rating), 2) AS avg_enjoyment_rating
FROM book_reading_sessions brs
JOIN books b ON b.id = brs.book_id
GROUP BY b.profile_id, DATE_TRUNC('month', brs.session_date)
ORDER BY month DESC;

COMMENT ON VIEW reading_activity_by_month IS 'Actividad de lectura agregada por mes';

-- ----------------------------------------------------------------------------
-- FUNCIÓN 1: Obtener recomendación de siguiente libro
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_next_book_to_read(p_profile_id UUID)
RETURNS TABLE (
  book_id UUID,
  title TEXT,
  author TEXT,
  priority_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.author,
    -- Calcular puntuación de prioridad
    (
      -- Libros pausados tienen más prioridad
      CASE WHEN b.status = 'paused' THEN 10 ELSE 0 END +
      -- Libros con fecha objetivo cercana
      CASE
        WHEN b.target_completion_date IS NOT NULL THEN
          (30 - EXTRACT(DAY FROM b.target_completion_date - CURRENT_DATE))
        ELSE 0
      END +
      -- Libros asociados a una materia
      CASE WHEN b.subject_id IS NOT NULL THEN 5 ELSE 0 END +
      -- Libros más avanzados
      (b.current_page::NUMERIC / b.total_pages * 10)
    )::NUMERIC AS priority_score
  FROM books b
  WHERE b.profile_id = p_profile_id
    AND b.status IN ('reading', 'paused', 'not_started')
  ORDER BY priority_score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_book_to_read IS 'Recomienda los siguientes libros a leer basado en prioridades';

-- ----------------------------------------------------------------------------
-- FUNCIÓN 2: Registrar sesión de lectura rápida
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_reading_session(
  p_book_id UUID,
  p_profile_id UUID,
  p_start_page INTEGER,
  p_end_page INTEGER,
  p_duration_minutes INTEGER,
  p_chapter_number INTEGER DEFAULT NULL,
  p_chapter_name TEXT DEFAULT NULL,
  p_focus_rating INTEGER DEFAULT NULL,
  p_enjoyment_rating INTEGER DEFAULT NULL,
  p_session_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Insertar sesión de lectura
  INSERT INTO book_reading_sessions (
    book_id, profile_id, start_page, end_page, duration_minutes,
    chapter_number, chapter_name, focus_rating, enjoyment_rating,
    session_notes, session_date, started_at, completed_at
  ) VALUES (
    p_book_id, p_profile_id, p_start_page, p_end_page, p_duration_minutes,
    p_chapter_number, p_chapter_name, p_focus_rating, p_enjoyment_rating,
    p_session_notes, CURRENT_DATE, NOW() - (p_duration_minutes || ' minutes')::INTERVAL, NOW()
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_reading_session IS 'Función helper para registrar una sesión de lectura rápidamente';

-- ----------------------------------------------------------------------------
-- FUNCIÓN 3: Obtener citas aleatorias de libros completados
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_random_quote(p_profile_id UUID)
RETURNS TABLE (
  quote_text TEXT,
  book_title TEXT,
  author TEXT,
  page_number INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bq.quote_text,
    b.title AS book_title,
    b.author,
    bq.page_number
  FROM book_quotes bq
  JOIN books b ON b.id = bq.book_id
  WHERE bq.profile_id = p_profile_id
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_random_quote IS 'Devuelve una cita aleatoria de los libros del usuario';

-- ============================================================================
-- INTEGRACIÓN CON SISTEMA DE POMODOROS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Agregar columna book_id a la tabla sessions (si no existe)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'book_id'
  ) THEN
    ALTER TABLE sessions
    ADD COLUMN book_id UUID REFERENCES books(id) ON DELETE SET NULL;

    CREATE INDEX idx_sessions_book ON sessions(book_id);

    COMMENT ON COLUMN sessions.book_id IS 'Libro asociado a esta sesión de pomodoro (opcional)';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- TRIGGER: Vincular sesión de pomodoro con sesión de lectura
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION link_pomodoro_to_reading()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la sesión de pomodoro tiene book_id, crear sesión de lectura automáticamente
  IF NEW.book_id IS NOT NULL AND NEW.status = 'completed' AND NEW.session_type = 'work' THEN
    -- Aquí podrías crear automáticamente una sesión de lectura
    -- o simplemente vincularlas para análisis posterior
    NULL; -- Por ahora solo vincular, el usuario registrará páginas manualmente
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER link_pomodoro_to_reading_trigger
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.book_id IS NOT NULL)
  EXECUTE FUNCTION link_pomodoro_to_reading();

-- ============================================================================
-- INTEGRACIÓN CON SEGUNDO CEREBRO (KNOWLEDGE GRAPH)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Actualizar vista knowledge_nodes para incluir libros
-- ----------------------------------------------------------------------------
-- Nota: Esto se debe ejecutar DESPUÉS de tener second_brain_schema.sql
-- Agrega libros como nodos en el grafo de conocimiento

CREATE OR REPLACE VIEW knowledge_nodes AS
WITH all_nodes AS (
  -- Materias
  SELECT
    'subject' AS node_type,
    s.id AS node_id,
    s.profile_id,
    s.name AS title,
    s.color,
    s.icon,
    COALESCE(SUM(sess.duration_seconds), 0) AS total_time_seconds,
    COUNT(sess.id) AS session_count,
    AVG(sess.focus_rating) AS avg_focus_rating
  FROM subjects s
  LEFT JOIN sessions sess ON sess.subject_id = s.id AND sess.status = 'completed'
  GROUP BY s.id, s.profile_id, s.name, s.color, s.icon

  UNION ALL

  -- Tareas
  SELECT
    'task' AS node_type,
    t.id AS node_id,
    (SELECT profile_id FROM subjects WHERE id = t.subject_id) AS profile_id,
    t.title,
    (SELECT color FROM subjects WHERE id = t.subject_id) AS color,
    NULL AS icon,
    COALESCE(SUM(sess.duration_seconds), 0) AS total_time_seconds,
    COUNT(sess.id) AS session_count,
    AVG(sess.focus_rating) AS avg_focus_rating
  FROM tasks t
  LEFT JOIN sessions sess ON sess.task_id = t.id AND sess.status = 'completed'
  GROUP BY t.id, t.title, t.subject_id

  UNION ALL

  -- Materiales
  SELECT
    'material' AS node_type,
    m.id AS node_id,
    m.profile_id,
    m.title,
    NULL AS color,
    NULL AS icon,
    COALESCE(SUM(sess.duration_seconds), 0) AS total_time_seconds,
    COUNT(sess.id) AS session_count,
    AVG(sess.focus_rating) AS avg_focus_rating
  FROM materials m
  LEFT JOIN sessions sess ON sess.material_id = m.id AND sess.status = 'completed'
  GROUP BY m.id, m.profile_id, m.title

  UNION ALL

  -- NUEVO: Libros
  SELECT
    'book' AS node_type,
    b.id AS node_id,
    b.profile_id,
    b.title || ' - ' || COALESCE(b.author, 'Autor desconocido') AS title,
    '#8B4513' AS color, -- Color marrón para libros
    '📚' AS icon,
    COALESCE(b.total_reading_time_minutes * 60, 0) AS total_time_seconds,
    (SELECT COUNT(*) FROM book_reading_sessions WHERE book_id = b.id) AS session_count,
    (SELECT AVG(focus_rating) FROM book_reading_sessions WHERE book_id = b.id) AS avg_focus_rating
  FROM books b
)
SELECT
  node_type,
  node_id,
  profile_id,
  title,
  color,
  icon,
  total_time_seconds,
  session_count,
  avg_focus_rating,
  -- Calcular tamaño del nodo (logarítmico)
  CASE
    WHEN total_time_seconds > 0 THEN LOG(total_time_seconds + 1) * 2 + 5
    ELSE 5
  END AS node_size
FROM all_nodes;

COMMENT ON VIEW knowledge_nodes IS 'Nodos del grafo de conocimiento incluyendo libros';

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Descomentar para insertar datos de ejemplo
/*
-- Insertar libro de ejemplo
INSERT INTO books (
  profile_id,
  title,
  author,
  total_pages,
  total_chapters,
  genre,
  isbn,
  status
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'Atomic Habits',
  'James Clear',
  320,
  20,
  'Autoayuda',
  '978-0735211292',
  'not_started'
);

-- Insertar objetivo de lectura
INSERT INTO reading_goals (
  profile_id,
  goal_type,
  goal_unit,
  target_amount,
  start_date,
  end_date,
  title
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'daily',
  'pages',
  30,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'Leer 30 páginas diarias'
);
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Para aplicar este script en Supabase:
-- 1. Ve a tu proyecto en Supabase Dashboard
-- 2. Abre el SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. Verifica que todas las tablas se crearon correctamente

SELECT 'Sistema de Libros instalado correctamente! 📚✨' AS status;
