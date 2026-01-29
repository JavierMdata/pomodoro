-- =====================================================
-- SCRIPT MAESTRO DEFINITIVO - ARREGLA TODO
-- =====================================================
-- Este script arregla TODAS las tablas con error 401/42501
-- Ejecuta TODO de una vez en Supabase SQL Editor

-- =====================================================
-- 1. CATEGORY_INSTANCES
-- =====================================================
ALTER TABLE IF EXISTS category_instances DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON category_instances;
DROP POLICY IF EXISTS "rls_insert" ON category_instances;
DROP POLICY IF EXISTS "rls_update" ON category_instances;
DROP POLICY IF EXISTS "rls_delete" ON category_instances;
ALTER TABLE IF EXISTS category_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON category_instances FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON category_instances FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON category_instances FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON category_instances FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 2. CLASS_SCHEDULE
-- =====================================================
ALTER TABLE IF EXISTS class_schedule DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON class_schedule;
DROP POLICY IF EXISTS "rls_insert" ON class_schedule;
DROP POLICY IF EXISTS "rls_update" ON class_schedule;
DROP POLICY IF EXISTS "rls_delete" ON class_schedule;
ALTER TABLE IF EXISTS class_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON class_schedule FOR SELECT TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "rls_insert" ON class_schedule FOR INSERT TO authenticated
WITH CHECK (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "rls_update" ON class_schedule FOR UPDATE TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "rls_delete" ON class_schedule FOR DELETE TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- =====================================================
-- 3. WORK_SCHEDULE
-- =====================================================
ALTER TABLE IF EXISTS work_schedule DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON work_schedule;
DROP POLICY IF EXISTS "rls_insert" ON work_schedule;
DROP POLICY IF EXISTS "rls_update" ON work_schedule;
DROP POLICY IF EXISTS "rls_delete" ON work_schedule;
ALTER TABLE IF EXISTS work_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON work_schedule FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON work_schedule FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON work_schedule FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON work_schedule FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 4. SUBJECT_TIME_ALLOCATION
-- =====================================================
ALTER TABLE IF EXISTS subject_time_allocation DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON subject_time_allocation;
DROP POLICY IF EXISTS "rls_insert" ON subject_time_allocation;
DROP POLICY IF EXISTS "rls_update" ON subject_time_allocation;
DROP POLICY IF EXISTS "rls_delete" ON subject_time_allocation;
ALTER TABLE IF EXISTS subject_time_allocation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON subject_time_allocation FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON subject_time_allocation FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON subject_time_allocation FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON subject_time_allocation FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 5. ACTIVE_TIMERS
-- =====================================================
ALTER TABLE IF EXISTS active_timers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON active_timers;
DROP POLICY IF EXISTS "rls_insert" ON active_timers;
DROP POLICY IF EXISTS "rls_update" ON active_timers;
DROP POLICY IF EXISTS "rls_delete" ON active_timers;
ALTER TABLE IF EXISTS active_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON active_timers FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON active_timers FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON active_timers FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON active_timers FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 6. CONTENT_BLOCKS
-- =====================================================
ALTER TABLE IF EXISTS content_blocks DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON content_blocks;
DROP POLICY IF EXISTS "rls_insert" ON content_blocks;
DROP POLICY IF EXISTS "rls_update" ON content_blocks;
DROP POLICY IF EXISTS "rls_delete" ON content_blocks;
ALTER TABLE IF EXISTS content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON content_blocks FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON content_blocks FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON content_blocks FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON content_blocks FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 7. NOTE_LINKS
-- =====================================================
ALTER TABLE IF EXISTS note_links DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON note_links;
DROP POLICY IF EXISTS "rls_insert" ON note_links;
DROP POLICY IF EXISTS "rls_update" ON note_links;
DROP POLICY IF EXISTS "rls_delete" ON note_links;
ALTER TABLE IF EXISTS note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON note_links FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON note_links FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON note_links FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON note_links FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 8. FOCUS_JOURNALS
-- =====================================================
ALTER TABLE IF EXISTS focus_journals DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_select" ON focus_journals;
DROP POLICY IF EXISTS "rls_insert" ON focus_journals;
DROP POLICY IF EXISTS "rls_update" ON focus_journals;
DROP POLICY IF EXISTS "rls_delete" ON focus_journals;
ALTER TABLE IF EXISTS focus_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON focus_journals FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_insert" ON focus_journals FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_update" ON focus_journals FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "rls_delete" ON focus_journals FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT
  '✅ POLÍTICAS CREADAS' as status,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE tablename IN (
  'category_instances',
  'class_schedule',
  'work_schedule',
  'subject_time_allocation',
  'active_timers',
  'content_blocks',
  'note_links',
  'focus_journals'
)
GROUP BY tablename
ORDER BY tablename;

-- DEBERÍAS VER 4 políticas por cada tabla = 32 total
