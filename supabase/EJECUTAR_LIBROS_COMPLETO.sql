-- ============================================================================
-- POMOSMART - SISTEMA COMPLETO DE LIBROS Y LECTURA
-- ============================================================================
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- Incluye: tablas, índices, triggers, vistas, funciones, RLS y permisos
-- ============================================================================

-- ============================================================================
-- PASO 1: LIMPIAR EXISTENTE (idempotente)
-- ============================================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('books', 'book_reading_sessions', 'book_quotes', 'reading_goals')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

DROP VIEW IF EXISTS top_favorite_authors CASCADE;
DROP VIEW IF EXISTS author_statistics CASCADE;
DROP VIEW IF EXISTS reading_activity_by_month CASCADE;
DROP VIEW IF EXISTS current_reading_progress CASCADE;
DROP VIEW IF EXISTS book_statistics_by_profile CASCADE;

DROP TABLE IF EXISTS book_quotes CASCADE;
DROP TABLE IF EXISTS book_reading_sessions CASCADE;
DROP TABLE IF EXISTS reading_goals CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- ============================================================================
-- PASO 2: CREAR TABLAS
-- ============================================================================

-- TABLA: books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,

  -- Información del libro
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  publisher TEXT,
  publication_year INTEGER,
  genre TEXT,
  language TEXT DEFAULT 'es',

  -- Estructura
  total_pages INTEGER NOT NULL CHECK (total_pages > 0),
  total_chapters INTEGER CHECK (total_chapters > 0),

  -- Progreso
  current_page INTEGER DEFAULT 0 CHECK (current_page >= 0),
  current_chapter INTEGER DEFAULT 0 CHECK (current_chapter >= 0),

  -- Fechas
  start_date DATE,
  halfway_date DATE,
  completion_date DATE,
  last_read_date DATE,

  -- Estado
  status TEXT DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'reading', 'paused', 'completed', 'abandoned')
  ),

  -- Objetivos
  daily_pages_goal INTEGER,
  target_completion_date DATE,

  -- Estadísticas (calculadas con triggers)
  total_reading_time_minutes INTEGER DEFAULT 0,
  pages_per_hour NUMERIC(5,2),
  reading_streak_days INTEGER DEFAULT 0,
  active_reading_days INTEGER DEFAULT 0,

  -- Metadata
  cover_url TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_books_profile ON books(profile_id);
CREATE INDEX idx_books_subject ON books(subject_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_last_read ON books(last_read_date DESC);
CREATE INDEX idx_books_tags ON books USING GIN(tags);

-- TABLA: book_reading_sessions
CREATE TABLE book_reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pomodoro_session_id UUID,

  -- Progreso
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL CHECK (end_page >= start_page),
  pages_read INTEGER GENERATED ALWAYS AS (end_page - start_page) STORED,

  chapter_number INTEGER,
  chapter_name TEXT,

  -- Tiempo
  session_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Evaluación
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5),
  enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 5),
  comprehension_rating INTEGER CHECK (comprehension_rating BETWEEN 1 AND 5),

  -- Notas
  session_notes TEXT,
  quick_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_session_times CHECK (
    completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
  )
);

CREATE INDEX idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_profile ON book_reading_sessions(profile_id);
CREATE INDEX idx_reading_sessions_date ON book_reading_sessions(session_date DESC);
CREATE INDEX idx_reading_sessions_pomodoro ON book_reading_sessions(pomodoro_session_id);

-- TABLA: book_quotes
CREATE TABLE book_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  quote_text TEXT NOT NULL,
  page_number INTEGER,
  chapter_number INTEGER,
  chapter_name TEXT,
  context TEXT,
  personal_note TEXT,
  category TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_book_quotes_book ON book_quotes(book_id);
CREATE INDEX idx_book_quotes_profile ON book_quotes(profile_id);
CREATE INDEX idx_book_quotes_favorite ON book_quotes(is_favorite);
CREATE INDEX idx_book_quotes_tags ON book_quotes USING GIN(tags);

-- TABLA: reading_goals
CREATE TABLE reading_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  goal_unit TEXT NOT NULL CHECK (goal_unit IN ('pages', 'chapters', 'books', 'minutes')),
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),

  current_progress INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN target_amount > 0 THEN (current_progress::NUMERIC / target_amount * 100) ELSE 0 END
  ) STORED,

  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reading_goals_profile ON reading_goals(profile_id);
CREATE INDEX idx_reading_goals_active ON reading_goals(is_active);
CREATE INDEX idx_reading_goals_dates ON reading_goals(start_date, end_date);

-- ============================================================================
-- PASO 3: RLS Y PERMISOS
-- ============================================================================

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_books" ON books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_book_reading_sessions" ON book_reading_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_book_quotes" ON book_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reading_goals" ON reading_goals FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON books TO authenticated, anon;
GRANT ALL ON book_reading_sessions TO authenticated, anon;
GRANT ALL ON book_quotes TO authenticated, anon;
GRANT ALL ON reading_goals TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- ============================================================================
-- PASO 4: TRIGGERS
-- ============================================================================

-- updated_at automático
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_updated_at_trigger ON books;
CREATE TRIGGER books_updated_at_trigger
  BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_books_updated_at();

DROP TRIGGER IF EXISTS book_quotes_updated_at_trigger ON book_quotes;
CREATE TRIGGER book_quotes_updated_at_trigger
  BEFORE UPDATE ON book_quotes FOR EACH ROW EXECUTE FUNCTION update_books_updated_at();

DROP TRIGGER IF EXISTS reading_goals_updated_at_trigger ON reading_goals;
CREATE TRIGGER reading_goals_updated_at_trigger
  BEFORE UPDATE ON reading_goals FOR EACH ROW EXECUTE FUNCTION update_books_updated_at();

-- Actualizar progreso del libro al registrar sesión
CREATE OR REPLACE FUNCTION update_book_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_book_pages INTEGER;
  v_halfway_page INTEGER;
  v_book_status TEXT;
BEGIN
  SELECT total_pages, status INTO v_book_pages, v_book_status FROM books WHERE id = NEW.book_id;
  v_halfway_page := v_book_pages / 2;

  UPDATE books SET
    current_page = GREATEST(current_page, NEW.end_page),
    current_chapter = COALESCE(NEW.chapter_number, current_chapter),
    last_read_date = NEW.session_date,
    start_date = COALESCE(start_date, NEW.session_date),
    halfway_date = CASE WHEN halfway_date IS NULL AND NEW.end_page >= v_halfway_page THEN NEW.session_date ELSE halfway_date END,
    completion_date = CASE WHEN NEW.end_page >= v_book_pages THEN NEW.session_date ELSE completion_date END,
    status = CASE WHEN NEW.end_page >= v_book_pages THEN 'completed' WHEN v_book_status = 'not_started' THEN 'reading' ELSE status END,
    total_reading_time_minutes = total_reading_time_minutes + NEW.duration_minutes,
    updated_at = NOW()
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_book_progress_trigger ON book_reading_sessions;
CREATE TRIGGER update_book_progress_trigger
  AFTER INSERT ON book_reading_sessions FOR EACH ROW EXECUTE FUNCTION update_book_progress();

-- Calcular velocidad de lectura
CREATE OR REPLACE FUNCTION calculate_reading_speed()
RETURNS TRIGGER AS $$
DECLARE
  v_total_pages INTEGER;
  v_total_minutes INTEGER;
  v_pages_per_hour NUMERIC(5,2);
BEGIN
  SELECT COALESCE(SUM(pages_read), 0), COALESCE(SUM(duration_minutes), 0)
  INTO v_total_pages, v_total_minutes FROM book_reading_sessions WHERE book_id = NEW.book_id;

  IF v_total_minutes > 0 THEN
    v_pages_per_hour := (v_total_pages::NUMERIC / v_total_minutes) * 60;
    UPDATE books SET pages_per_hour = v_pages_per_hour WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_reading_speed_trigger ON book_reading_sessions;
CREATE TRIGGER calculate_reading_speed_trigger
  AFTER INSERT ON book_reading_sessions FOR EACH ROW EXECUTE FUNCTION calculate_reading_speed();

-- Actualizar racha de lectura
CREATE OR REPLACE FUNCTION update_reading_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_read_date DATE;
  v_current_streak INTEGER;
  v_active_days INTEGER;
BEGIN
  SELECT last_read_date, reading_streak_days, active_reading_days
  INTO v_last_read_date, v_current_streak, v_active_days FROM books WHERE id = NEW.book_id;

  IF v_last_read_date IS NULL THEN
    v_current_streak := 1;
  ELSIF NEW.session_date = v_last_read_date + INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSIF NEW.session_date = v_last_read_date THEN
    v_current_streak := v_current_streak;
  ELSE
    v_current_streak := 1;
  END IF;

  SELECT COUNT(DISTINCT session_date) INTO v_active_days FROM book_reading_sessions WHERE book_id = NEW.book_id;

  UPDATE books SET reading_streak_days = v_current_streak, active_reading_days = v_active_days WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reading_streak_trigger ON book_reading_sessions;
CREATE TRIGGER update_reading_streak_trigger
  AFTER INSERT ON book_reading_sessions FOR EACH ROW EXECUTE FUNCTION update_reading_streak();

-- ============================================================================
-- PASO 5: VISTAS
-- ============================================================================

CREATE VIEW book_statistics_by_profile AS
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
FROM books b GROUP BY b.profile_id;

CREATE VIEW current_reading_progress AS
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
  CASE WHEN b.pages_per_hour > 0
    THEN ROUND(((b.total_pages - b.current_page)::NUMERIC / b.pages_per_hour) * 60)
    ELSE NULL END AS estimated_minutes_remaining,
  CASE WHEN b.pages_per_hour > 0 AND b.daily_pages_goal > 0
    THEN b.last_read_date + ((b.total_pages - b.current_page)::NUMERIC / b.daily_pages_goal)::INTEGER
    ELSE NULL END AS estimated_completion_date,
  b.reading_streak_days,
  b.status
FROM books b WHERE b.status IN ('reading', 'paused');

CREATE VIEW reading_activity_by_month AS
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

CREATE VIEW author_statistics AS
SELECT
  b.profile_id,
  COALESCE(NULLIF(TRIM(b.author), ''), 'Autor Desconocido') AS author,
  COUNT(*) AS total_books,
  COUNT(*) FILTER (WHERE b.status = 'completed') AS books_completed,
  COUNT(*) FILTER (WHERE b.status = 'reading') AS books_reading,
  COUNT(*) FILTER (WHERE b.status = 'not_started') AS books_pending,
  COALESCE(SUM(b.total_pages) FILTER (WHERE b.status = 'completed'), 0) AS total_pages_read,
  COALESCE(SUM(b.total_reading_time_minutes), 0) AS total_reading_time_minutes,
  ROUND(AVG(b.pages_per_hour) FILTER (WHERE b.pages_per_hour > 0), 2) AS avg_reading_speed,
  ROUND(AVG(b.rating) FILTER (WHERE b.rating IS NOT NULL), 2) AS avg_rating,
  MAX(b.reading_streak_days) AS max_streak,
  MIN(b.start_date) AS first_book_started,
  MAX(b.completion_date) AS last_book_completed,
  CASE WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE b.status = 'completed')::NUMERIC / COUNT(*)) * 100, 2)
    ELSE 0 END AS completion_rate
FROM books b
WHERE b.author IS NOT NULL AND TRIM(b.author) != ''
GROUP BY b.profile_id, COALESCE(NULLIF(TRIM(b.author), ''), 'Autor Desconocido')
ORDER BY books_completed DESC, total_books DESC;

CREATE VIEW top_favorite_authors AS
SELECT
  b.profile_id,
  COALESCE(NULLIF(TRIM(b.author), ''), 'Autor Desconocido') AS author,
  COUNT(*) AS books_count,
  COUNT(*) FILTER (WHERE b.is_favorite = TRUE) AS favorite_books_count,
  ROUND(AVG(b.rating) FILTER (WHERE b.rating IS NOT NULL), 1) AS avg_rating,
  SUM(b.total_reading_time_minutes) AS total_time_minutes,
  (
    (COUNT(*) FILTER (WHERE b.is_favorite = TRUE) * 10) +
    (COUNT(*) FILTER (WHERE b.status = 'completed') * 5) +
    (COALESCE(AVG(b.rating), 0) * 3) +
    (COUNT(*) * 2)
  ) AS favorite_score
FROM books b
WHERE b.author IS NOT NULL AND TRIM(b.author) != ''
GROUP BY b.profile_id, COALESCE(NULLIF(TRIM(b.author), ''), 'Autor Desconocido')
HAVING COUNT(*) > 0
ORDER BY favorite_score DESC;

-- ============================================================================
-- PASO 6: FUNCIONES AUXILIARES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_book_to_read(p_profile_id UUID)
RETURNS TABLE (book_id UUID, title TEXT, author TEXT, priority_score NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.title, b.author,
    (
      CASE WHEN b.status = 'paused' THEN 10 ELSE 0 END +
      CASE WHEN b.target_completion_date IS NOT NULL THEN (30 - EXTRACT(DAY FROM b.target_completion_date - CURRENT_DATE)) ELSE 0 END +
      CASE WHEN b.subject_id IS NOT NULL THEN 5 ELSE 0 END +
      (b.current_page::NUMERIC / b.total_pages * 10)
    )::NUMERIC AS priority_score
  FROM books b
  WHERE b.profile_id = p_profile_id AND b.status IN ('reading', 'paused', 'not_started')
  ORDER BY priority_score DESC LIMIT 5;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_reading_session(
  p_book_id UUID, p_profile_id UUID, p_start_page INTEGER, p_end_page INTEGER, p_duration_minutes INTEGER,
  p_chapter_number INTEGER DEFAULT NULL, p_chapter_name TEXT DEFAULT NULL,
  p_focus_rating INTEGER DEFAULT NULL, p_enjoyment_rating INTEGER DEFAULT NULL, p_session_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE v_session_id UUID;
BEGIN
  INSERT INTO book_reading_sessions (
    book_id, profile_id, start_page, end_page, duration_minutes,
    chapter_number, chapter_name, focus_rating, enjoyment_rating, session_notes,
    session_date, started_at, completed_at
  ) VALUES (
    p_book_id, p_profile_id, p_start_page, p_end_page, p_duration_minutes,
    p_chapter_number, p_chapter_name, p_focus_rating, p_enjoyment_rating, p_session_notes,
    CURRENT_DATE, NOW() - (p_duration_minutes || ' minutes')::INTERVAL, NOW()
  ) RETURNING id INTO v_session_id;
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_random_quote(p_profile_id UUID)
RETURNS TABLE (quote_text TEXT, book_title TEXT, author TEXT, page_number INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT bq.quote_text, b.title AS book_title, b.author, bq.page_number
  FROM book_quotes bq JOIN books b ON b.id = bq.book_id
  WHERE bq.profile_id = p_profile_id ORDER BY RANDOM() LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT
  '✅ Sistema de Libros instalado!' AS status,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('books', 'book_reading_sessions', 'book_quotes', 'reading_goals')) AS tablas,
  (SELECT COUNT(*) FROM information_schema.views
   WHERE table_schema = 'public'
   AND table_name IN ('book_statistics_by_profile', 'current_reading_progress', 'reading_activity_by_month', 'author_statistics', 'top_favorite_authors')) AS vistas,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('books', 'book_reading_sessions', 'book_quotes', 'reading_goals')) AS politicas;
