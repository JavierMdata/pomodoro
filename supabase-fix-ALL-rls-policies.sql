-- =====================================================
-- SCRIPT MAESTRO: Arreglar RLS en TODAS las tablas
-- =====================================================
-- Este script arregla los permisos en todas las tablas que dan error 401

-- =====================================================
-- 1. CATEGORY_INSTANCES
-- =====================================================
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

CREATE POLICY "Users can view their own category instances"
ON category_instances FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own category instances"
ON category_instances FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own category instances"
ON category_instances FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own category instances"
ON category_instances FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 2. CLASS_SCHEDULE
-- =====================================================
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Users can insert their own class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Users can update their own class schedules" ON class_schedule;
DROP POLICY IF EXISTS "Users can delete their own class schedules" ON class_schedule;

CREATE POLICY "Users can view their own class schedules"
ON class_schedule FOR SELECT
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert their own class schedules"
ON class_schedule FOR INSERT
WITH CHECK (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can update their own class schedules"
ON class_schedule FOR UPDATE
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete their own class schedules"
ON class_schedule FOR DELETE
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- =====================================================
-- 3. WORK_SCHEDULE
-- =====================================================
ALTER TABLE work_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own work schedules" ON work_schedule;
DROP POLICY IF EXISTS "Users can insert their own work schedules" ON work_schedule;
DROP POLICY IF EXISTS "Users can update their own work schedules" ON work_schedule;
DROP POLICY IF EXISTS "Users can delete their own work schedules" ON work_schedule;

CREATE POLICY "Users can view their own work schedules"
ON work_schedule FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own work schedules"
ON work_schedule FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own work schedules"
ON work_schedule FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own work schedules"
ON work_schedule FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 4. SUBJECT_TIME_ALLOCATION
-- =====================================================
ALTER TABLE subject_time_allocation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own time allocations" ON subject_time_allocation;
DROP POLICY IF EXISTS "Users can insert their own time allocations" ON subject_time_allocation;
DROP POLICY IF EXISTS "Users can update their own time allocations" ON subject_time_allocation;
DROP POLICY IF EXISTS "Users can delete their own time allocations" ON subject_time_allocation;

CREATE POLICY "Users can view their own time allocations"
ON subject_time_allocation FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own time allocations"
ON subject_time_allocation FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own time allocations"
ON subject_time_allocation FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own time allocations"
ON subject_time_allocation FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 5. ACTIVE_TIMERS
-- =====================================================
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own active timers" ON active_timers;
DROP POLICY IF EXISTS "Users can insert their own active timers" ON active_timers;
DROP POLICY IF EXISTS "Users can update their own active timers" ON active_timers;
DROP POLICY IF EXISTS "Users can delete their own active timers" ON active_timers;

CREATE POLICY "Users can view their own active timers"
ON active_timers FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own active timers"
ON active_timers FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own active timers"
ON active_timers FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own active timers"
ON active_timers FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 6. CONTENT_BLOCKS (Segundo Cerebro)
-- =====================================================
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Users can insert their own content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Users can update their own content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Users can delete their own content blocks" ON content_blocks;

CREATE POLICY "Users can view their own content blocks"
ON content_blocks FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own content blocks"
ON content_blocks FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own content blocks"
ON content_blocks FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own content blocks"
ON content_blocks FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 7. NOTE_LINKS (Segundo Cerebro)
-- =====================================================
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own note links" ON note_links;
DROP POLICY IF EXISTS "Users can insert their own note links" ON note_links;
DROP POLICY IF EXISTS "Users can update their own note links" ON note_links;
DROP POLICY IF EXISTS "Users can delete their own note links" ON note_links;

CREATE POLICY "Users can view their own note links"
ON note_links FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own note links"
ON note_links FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own note links"
ON note_links FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own note links"
ON note_links FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 8. FOCUS_JOURNALS (Segundo Cerebro)
-- =====================================================
ALTER TABLE focus_journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own focus journals" ON focus_journals;
DROP POLICY IF EXISTS "Users can insert their own focus journals" ON focus_journals;
DROP POLICY IF EXISTS "Users can update their own focus journals" ON focus_journals;
DROP POLICY IF EXISTS "Users can delete their own focus journals" ON focus_journals;

CREATE POLICY "Users can view their own focus journals"
ON focus_journals FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own focus journals"
ON focus_journals FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own focus journals"
ON focus_journals FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own focus journals"
ON focus_journals FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Ver todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
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
ORDER BY tablename, cmd;

-- Deberías ver 4 políticas (SELECT, INSERT, UPDATE, DELETE) por cada tabla = 32 políticas total
