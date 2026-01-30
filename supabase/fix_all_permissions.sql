-- ============================================
-- FIX COMPLETO: Permisos RLS para todas las tablas
-- ============================================

-- Asegurar que la extensión uuid esté habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CATEGORY INSTANCES
-- ============================================

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

-- ============================================
-- 2. CLASS SCHEDULE (CRÍTICO)
-- ============================================

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

-- ============================================
-- 3. SUBJECTS (por si acaso)
-- ============================================

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

-- ============================================
-- 4. TASKS (por si acaso)
-- ============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to create tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to delete tasks" ON tasks;

CREATE POLICY "Allow all to view tasks"
  ON tasks FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create tasks"
  ON tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update tasks"
  ON tasks FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete tasks"
  ON tasks FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon;

-- ============================================
-- 5. EXAMS (por si acaso)
-- ============================================

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to create exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to update exams" ON exams;
DROP POLICY IF EXISTS "Allow authenticated to delete exams" ON exams;

CREATE POLICY "Allow all to view exams"
  ON exams FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create exams"
  ON exams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update exams"
  ON exams FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete exams"
  ON exams FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON exams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exams TO anon;

-- ============================================
-- 6. EXAM TOPICS (por si acaso)
-- ============================================

ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to create exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to update exam topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow authenticated to delete exam topics" ON exam_topics;

CREATE POLICY "Allow all to view exam topics"
  ON exam_topics FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create exam topics"
  ON exam_topics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update exam topics"
  ON exam_topics FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete exam topics"
  ON exam_topics FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON exam_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_topics TO anon;

-- ============================================
-- 7. MATERIALS (por si acaso)
-- ============================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to view materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to create materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to update materials" ON materials;
DROP POLICY IF EXISTS "Allow authenticated to delete materials" ON materials;

CREATE POLICY "Allow all to view materials"
  ON materials FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to create materials"
  ON materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated to update materials"
  ON materials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete materials"
  ON materials FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON materials TO anon;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Permisos RLS configurados correctamente para todas las tablas';
  RAISE NOTICE '✅ Políticas creadas: category_instances, class_schedule, subjects, tasks, exams, exam_topics, materials';
  RAISE NOTICE '✅ Permisos otorgados a: authenticated y anon';
END $$;
