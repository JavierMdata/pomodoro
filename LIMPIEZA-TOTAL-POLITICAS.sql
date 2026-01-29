-- =====================================================
-- LIMPIEZA TOTAL DE POLÍTICAS DUPLICADAS
-- =====================================================
-- Este script elimina TODAS las políticas duplicadas
-- y deja solo las 4 necesarias por tabla (32 total)

-- =====================================================
-- LIMPIAR category_instances (tiene 4, está OK)
-- =====================================================
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;
-- Eliminar todas las posibles políticas
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'category_instances'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON category_instances', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

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
-- LIMPIAR active_timers (tiene 13, debe ser 4)
-- =====================================================
ALTER TABLE active_timers DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'active_timers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON active_timers', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON active_timers FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON active_timers FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON active_timers FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON active_timers FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- LIMPIAR class_schedule (tiene 12, debe ser 4)
-- =====================================================
ALTER TABLE class_schedule DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'class_schedule'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON class_schedule', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON class_schedule FOR SELECT TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "rls_insert" ON class_schedule FOR INSERT TO authenticated
WITH CHECK (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "rls_update" ON class_schedule FOR UPDATE TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "rls_delete" ON class_schedule FOR DELETE TO authenticated
USING (subject_id IN (SELECT id FROM subjects WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- =====================================================
-- LIMPIAR content_blocks (tiene 12, debe ser 4)
-- =====================================================
ALTER TABLE content_blocks DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'content_blocks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON content_blocks', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON content_blocks FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON content_blocks FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON content_blocks FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON content_blocks FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- LIMPIAR focus_journals (tiene 12, debe ser 4)
-- =====================================================
ALTER TABLE focus_journals DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'focus_journals'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON focus_journals', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE focus_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON focus_journals FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON focus_journals FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON focus_journals FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON focus_journals FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- LIMPIAR note_links (tiene 12, debe ser 4)
-- =====================================================
ALTER TABLE note_links DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'note_links'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON note_links', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON note_links FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON note_links FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON note_links FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON note_links FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- LIMPIAR subject_time_allocation (tiene 8, debe ser 4)
-- =====================================================
ALTER TABLE subject_time_allocation DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'subject_time_allocation'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON subject_time_allocation', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE subject_time_allocation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON subject_time_allocation FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON subject_time_allocation FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON subject_time_allocation FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON subject_time_allocation FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- LIMPIAR work_schedule (tiene 8, debe ser 4)
-- =====================================================
ALTER TABLE work_schedule DISABLE ROW LEVEL SECURITY;
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'work_schedule'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON work_schedule', pol.policyname);
    END LOOP;
END $$;
ALTER TABLE work_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_select" ON work_schedule FOR SELECT TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_insert" ON work_schedule FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_update" ON work_schedule FOR UPDATE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "rls_delete" ON work_schedule FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT
  '✅ RESULTADO FINAL' as status,
  tablename,
  COUNT(*) as num_policies,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ CORRECTO'
    ELSE '❌ ERROR - Deberían ser 4'
  END as validation
FROM pg_policies
WHERE tablename IN (
  'category_instances',
  'active_timers',
  'class_schedule',
  'content_blocks',
  'focus_journals',
  'note_links',
  'subject_time_allocation',
  'work_schedule'
)
GROUP BY tablename
ORDER BY tablename;

-- Deberías ver 4 políticas por cada tabla con status ✅ CORRECTO
