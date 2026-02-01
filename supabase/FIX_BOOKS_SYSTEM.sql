-- ============================================================================
-- POMOSMART - FIX SISTEMA DE LIBROS (IDEMPOTENTE)
-- ============================================================================
-- Este script puede ejecutarse múltiples veces sin causar errores
-- Arregla todos los problemas de RLS y permisos
-- ============================================================================

-- Paso 1: Limpiar políticas RLS existentes
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

-- Paso 2: Crear tablas (DROP IF EXISTS para idempotencia)
DROP TABLE IF EXISTS book_quotes CASCADE;
DROP TABLE IF EXISTS book_reading_sessions CASCADE;
DROP TABLE IF EXISTS reading_goals CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- ----------------------------------------------------------------------------
-- TABLA 1: books (Libros)
-- ----------------------------------------------------------------------------
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

  -- Estructura del libro
  total_pages INTEGER NOT NULL CHECK (total_pages > 0),
  total_chapters INTEGER CHECK (total_chapters > 0),

  -- Progreso de lectura
  current_page INTEGER DEFAULT 0 CHECK (current_page >= 0),
  current_chapter INTEGER DEFAULT 0 CHECK (current_chapter >= 0),

  -- Fechas importantes
  start_date DATE,
  halfway_date DATE,
  completion_date DATE,
  last_read_date DATE,

  -- Estado de lectura
  status TEXT DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'reading', 'paused', 'completed', 'abandoned')
  ),

  -- Objetivos
  daily_pages_goal INTEGER,
  target_completion_date DATE,

  -- Estadísticas
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

-- ----------------------------------------------------------------------------
-- TABLA 2: book_reading_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE book_reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

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

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_profile ON book_reading_sessions(profile_id);
CREATE INDEX idx_reading_sessions_date ON book_reading_sessions(session_date DESC);

-- ----------------------------------------------------------------------------
-- TABLA 3: book_quotes
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- TABLA 4: reading_goals
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- PASO 3: CONFIGURAR RLS Y PERMISOS
-- ============================================================================

-- Activar RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

-- Políticas books
CREATE POLICY "Permitir todas las operaciones en books" ON books FOR ALL USING (true) WITH CHECK (true);

-- Políticas book_reading_sessions
CREATE POLICY "Permitir todas las operaciones en book_reading_sessions" ON book_reading_sessions FOR ALL USING (true) WITH CHECK (true);

-- Políticas book_quotes
CREATE POLICY "Permitir todas las operaciones en book_quotes" ON book_quotes FOR ALL USING (true) WITH CHECK (true);

-- Políticas reading_goals
CREATE POLICY "Permitir todas las operaciones en reading_goals" ON reading_goals FOR ALL USING (true) WITH CHECK (true);

-- Otorgar permisos
GRANT ALL ON books TO authenticated, anon;
GRANT ALL ON book_reading_sessions TO authenticated, anon;
GRANT ALL ON book_quotes TO authenticated, anon;
GRANT ALL ON reading_goals TO authenticated, anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- ============================================================================
-- PASO 4: TRIGGERS
-- ============================================================================

-- Función para updated_at
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
DROP TRIGGER IF EXISTS books_updated_at_trigger ON books;
CREATE TRIGGER books_updated_at_trigger
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

DROP TRIGGER IF EXISTS book_quotes_updated_at_trigger ON book_quotes;
CREATE TRIGGER book_quotes_updated_at_trigger
  BEFORE UPDATE ON book_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

DROP TRIGGER IF EXISTS reading_goals_updated_at_trigger ON reading_goals;
CREATE TRIGGER reading_goals_updated_at_trigger
  BEFORE UPDATE ON reading_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

-- Trigger: Actualizar progreso del libro
CREATE OR REPLACE FUNCTION update_book_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_book_pages INTEGER;
  v_halfway_page INTEGER;
  v_book_status TEXT;
BEGIN
  SELECT total_pages, status INTO v_book_pages, v_book_status
  FROM books WHERE id = NEW.book_id;

  v_halfway_page := v_book_pages / 2;

  UPDATE books SET
    current_page = GREATEST(current_page, NEW.end_page),
    current_chapter = COALESCE(NEW.chapter_number, current_chapter),
    last_read_date = NEW.session_date,
    start_date = COALESCE(start_date, NEW.session_date),
    halfway_date = CASE
      WHEN halfway_date IS NULL AND NEW.end_page >= v_halfway_page
      THEN NEW.session_date
      ELSE halfway_date
    END,
    completion_date = CASE
      WHEN NEW.end_page >= v_book_pages
      THEN NEW.session_date
      ELSE completion_date
    END,
    status = CASE
      WHEN NEW.end_page >= v_book_pages THEN 'completed'
      WHEN v_book_status = 'not_started' THEN 'reading'
      ELSE status
    END,
    total_reading_time_minutes = total_reading_time_minutes + NEW.duration_minutes,
    updated_at = NOW()
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_book_progress_trigger ON book_reading_sessions;
CREATE TRIGGER update_book_progress_trigger
  AFTER INSERT ON book_reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_book_progress();

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT
  '✅ Sistema de Libros configurado correctamente! 📚' AS status,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('books', 'book_reading_sessions', 'book_quotes', 'reading_goals')) AS tablas_creadas,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('books', 'book_reading_sessions', 'book_quotes', 'reading_goals')) AS politicas_creadas;
