-- ============================================================================
-- POMOSMART - SETUP COMPLETO
-- ============================================================================
-- Este script configura:
-- 1. Permisos RLS para TODAS las tablas existentes
-- 2. Sistema completo de gestión de libros y lectura
-- 3. Permisos RLS para las tablas de libros
-- ============================================================================

-- Asegurar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PARTE 1: PERMISOS RLS PARA TABLAS EXISTENTES
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1.1 CATEGORY INSTANCES
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view category instances" ON category_instances;
DROP POLICY IF EXISTS "Allow authenticated to create category instances" ON category_instances;
DROP POLICY IF EXISTS "Allow authenticated to update category instances" ON category_instances;
DROP POLICY IF EXISTS "Allow authenticated to delete category instances" ON category_instances;

CREATE POLICY "Allow all to view category instances"
  ON category_instances FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create category instances"
  ON category_instances FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update category instances"
  ON category_instances FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete category instances"
  ON category_instances FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON category_instances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON category_instances TO anon;

-- ────────────────────────────────────────────────────────────────────────────
-- 1.2 CLASS SCHEDULE
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Allow authenticated to create class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Allow authenticated to update class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Allow authenticated to delete class schedules" ON class_schedule;

CREATE POLICY "Allow all to view class schedules"
  ON class_schedule FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create class schedules"
  ON class_schedule FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update class schedules"
  ON class_schedule FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete class schedules"
  ON class_schedule FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON class_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON class_schedule TO anon;

-- ────────────────────────────────────────────────────────────────────────────
-- 1.3 SUBJECTS
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view subjects" ON subjects;
DROP POLICY IF EXISTS "Allow authenticated to create subjects" ON subjects;
DROP POLICY IF EXISTS "Allow authenticated to update subjects" ON subjects;
DROP POLICY IF EXISTS "Allow authenticated to delete subjects" ON subjects;

CREATE POLICY "Allow all to view subjects"
  ON subjects FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create subjects"
  ON subjects FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update subjects"
  ON subjects FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete subjects"
  ON subjects FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subjects TO anon;

-- ────────────────────────────────────────────────────────────────────────────
-- 1.4 TASKS, EXAMS, EXAM_TOPICS, MATERIALS
-- ────────────────────────────────────────────────────────────────────────────

-- TASKS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to create tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to delete tasks" ON tasks;

CREATE POLICY "Allow all to view tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update tasks" ON tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete tasks" ON tasks FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon;

-- EXAMS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to create exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to update exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to delete exams" ON exams;

CREATE POLICY "Allow all to view exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create exams" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update exams" ON exams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete exams" ON exams FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON exams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exams TO anon;

-- EXAM TOPICS
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to create exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to update exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to delete exam topics" ON exam_topics;

CREATE POLICY "Allow all to view exam topics" ON exam_topics FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create exam topics" ON exam_topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update exam topics" ON exam_topics FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete exam topics" ON exam_topics FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON exam_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_topics TO anon;

-- MATERIALS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to create materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to update materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to delete materials" ON materials;

CREATE POLICY "Allow all to view materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create materials" ON materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update materials" ON materials FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete materials" ON materials FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON materials TO anon;

-- ============================================================================
-- PARTE 2: SISTEMA DE LIBROS Y LECTURA
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 2.1 TABLA: books (Libros)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS books (
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

  -- Notas y rating
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  favorite BOOLEAN DEFAULT false,

  -- Metadatos
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para books
CREATE INDEX IF NOT EXISTS idx_books_profile ON books(profile_id);
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_favorite ON books(favorite);

-- ────────────────────────────────────────────────────────────────────────────
-- 2.2 TABLA: book_reading_sessions (Sesiones de Lectura)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS book_reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Detalles de la sesión
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL CHECK (end_page >= start_page),
  pages_read INTEGER GENERATED ALWAYS AS (end_page - start_page) STORED,

  -- Tiempo de lectura
  duration_minutes INTEGER,
  start_time TIME,
  end_time TIME,

  -- Notas de la sesión
  notes TEXT,
  mood TEXT,
  comprehension_level INTEGER CHECK (comprehension_level BETWEEN 1 AND 5),

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para book_reading_sessions
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_profile ON book_reading_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON book_reading_sessions(session_date);

-- ────────────────────────────────────────────────────────────────────────────
-- 2.3 TABLA: book_quotes (Citas de Libros)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS book_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contenido de la cita
  quote_text TEXT NOT NULL,
  page_number INTEGER,
  chapter_number INTEGER,

  -- Contexto y reflexión
  context TEXT,
  personal_note TEXT,
  tags TEXT[],

  -- Favoritos
  is_favorite BOOLEAN DEFAULT false,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para book_quotes
CREATE INDEX IF NOT EXISTS idx_quotes_book ON book_quotes(book_id);
CREATE INDEX IF NOT EXISTS idx_quotes_profile ON book_quotes(profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_favorite ON book_quotes(is_favorite);

-- ────────────────────────────────────────────────────────────────────────────
-- 2.4 TRIGGERS DE ACTUALIZACIÓN
-- ────────────────────────────────────────────────────────────────────────────

-- Trigger para actualizar updated_at en books
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_books_updated_at ON books;
CREATE TRIGGER trigger_update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_books_updated_at();

-- Trigger para actualizar updated_at en book_quotes
CREATE OR REPLACE FUNCTION update_book_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_quotes_updated_at ON book_quotes;
CREATE TRIGGER trigger_update_book_quotes_updated_at
  BEFORE UPDATE ON book_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_book_quotes_updated_at();

-- ============================================================================
-- PARTE 3: PERMISOS RLS PARA TABLAS DE LIBROS
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 3.1 BOOKS
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view books" ON books;
DROP POLICY IF EXISTS "Allow authenticated to create books" ON books;
DROP POLICY IF EXISTS "Allow authenticated to update books" ON books;
DROP POLICY IF EXISTS "Allow authenticated to delete books" ON books;

CREATE POLICY "Allow all to view books" ON books FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create books" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update books" ON books FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete books" ON books FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON books TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON books TO anon;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.2 BOOK READING SESSIONS
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view book reading sessions" ON book_reading_sessions;
DROP POLICY IF EXISTS "Allow authenticated to create book reading sessions" ON book_reading_sessions;
DROP POLICY IF EXISTS "Allow authenticated to update book reading sessions" ON book_reading_sessions;
DROP POLICY IF EXISTS "Allow authenticated to delete book reading sessions" ON book_reading_sessions;

CREATE POLICY "Allow all to view book reading sessions" ON book_reading_sessions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create book reading sessions" ON book_reading_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update book reading sessions" ON book_reading_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete book reading sessions" ON book_reading_sessions FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON book_reading_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON book_reading_sessions TO anon;

-- ────────────────────────────────────────────────────────────────────────────
-- 3.3 BOOK QUOTES
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Allow authenticated to create book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Allow authenticated to update book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Allow authenticated to delete book quotes" ON book_quotes;

CREATE POLICY "Allow all to view book quotes" ON book_quotes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to create book quotes" ON book_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to update book quotes" ON book_quotes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete book quotes" ON book_quotes FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON book_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON book_quotes TO anon;

-- ============================================================================
-- CONFIRMACIÓN FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SETUP COMPLETO EJECUTADO EXITOSAMENTE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PERMISOS RLS CONFIGURADOS:';
  RAISE NOTICE '   ✓ category_instances';
  RAISE NOTICE '   ✓ class_schedule';
  RAISE NOTICE '   ✓ subjects';
  RAISE NOTICE '   ✓ tasks';
  RAISE NOTICE '   ✓ exams';
  RAISE NOTICE '   ✓ exam_topics';
  RAISE NOTICE '   ✓ materials';
  RAISE NOTICE '';
  RAISE NOTICE '📚 SISTEMA DE LIBROS CREADO:';
  RAISE NOTICE '   ✓ books (libros)';
  RAISE NOTICE '   ✓ book_reading_sessions (sesiones de lectura)';
  RAISE NOTICE '   ✓ book_quotes (citas de libros)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 PERMISOS OTORGADOS:';
  RAISE NOTICE '   ✓ authenticated';
  RAISE NOTICE '   ✓ anon';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
