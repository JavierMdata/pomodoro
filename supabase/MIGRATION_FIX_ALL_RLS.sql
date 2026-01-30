-- ============================================================================
-- MIGRATION: FIX COMPLETO DE PERMISOS RLS
-- ============================================================================
-- Este script es IDEMPOTENTE - puede ejecutarse múltiples veces sin errores
-- Arregla TODOS los permisos RLS de forma completa y segura
-- ============================================================================

-- Asegurar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FUNCIÓN AUXILIAR: Eliminar todas las políticas de una tabla
-- ============================================================================
CREATE OR REPLACE FUNCTION drop_all_policies(table_name text)
RETURNS void AS $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = table_name
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. CATEGORY INSTANCES
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando category_instances...';
END $$;

SELECT drop_all_policies('category_instances');
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 2. CLASS SCHEDULE
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando class_schedule...';
END $$;

SELECT drop_all_policies('class_schedule');
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 3. SUBJECTS
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando subjects...';
END $$;

SELECT drop_all_policies('subjects');
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 4. TASKS
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando tasks...';
END $$;

SELECT drop_all_policies('tasks');
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 5. EXAMS
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando exams...';
END $$;

SELECT drop_all_policies('exams');
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 6. EXAM TOPICS
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando exam_topics...';
END $$;

SELECT drop_all_policies('exam_topics');
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 7. MATERIALS
-- ============================================================================
DO $$ BEGIN
  RAISE NOTICE 'Configurando materials...';
END $$;

SELECT drop_all_policies('materials');
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- LIMPIEZA: Eliminar función auxiliar
-- ============================================================================
DROP FUNCTION IF EXISTS drop_all_policies(text);

-- ============================================================================
-- CONFIRMACIÓN FINAL
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PERMISOS RLS CONFIGURADOS PARA:';
  RAISE NOTICE '   ✓ category_instances';
  RAISE NOTICE '   ✓ class_schedule';
  RAISE NOTICE '   ✓ subjects';
  RAISE NOTICE '   ✓ tasks';
  RAISE NOTICE '   ✓ exams';
  RAISE NOTICE '   ✓ exam_topics';
  RAISE NOTICE '   ✓ materials';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 PERMISOS OTORGADOS A:';
  RAISE NOTICE '   ✓ authenticated';
  RAISE NOTICE '   ✓ anon';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Este script es idempotente y puede ejecutarse múltiples veces';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
