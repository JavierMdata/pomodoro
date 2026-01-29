-- =====================================================
-- LIMPIEZA FINAL Y DEFINITIVA
-- =====================================================
-- Este script elimina TODAS las políticas duplicadas
-- y crea solo UN set que funciona

-- PASO 1: DESACTIVAR RLS temporalmente
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;

-- PASO 2: ELIMINAR **TODAS** LAS POLÍTICAS (duplicadas)
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;
DROP POLICY IF EXISTS "category_instances_select_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_insert_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_update_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_delete_policy" ON category_instances;
DROP POLICY IF EXISTS "select_own_categories" ON category_instances;
DROP POLICY IF EXISTS "insert_own_categories" ON category_instances;
DROP POLICY IF EXISTS "update_own_categories" ON category_instances;
DROP POLICY IF EXISTS "delete_own_categories" ON category_instances;

-- PASO 3: RE-ACTIVAR RLS
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- PASO 4: CREAR **SOLO 4 POLÍTICAS** - Las más simples posibles

-- 1. SELECT
CREATE POLICY "rls_select"
ON category_instances
FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- 2. INSERT
CREATE POLICY "rls_insert"
ON category_instances
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- 3. UPDATE
CREATE POLICY "rls_update"
ON category_instances
FOR UPDATE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- 4. DELETE
CREATE POLICY "rls_delete"
ON category_instances
FOR DELETE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- PASO 5: VERIFICAR - Ahora deberías tener SOLO 4 políticas
SELECT
  '✅ Políticas creadas:' as status,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'category_instances'
ORDER BY cmd;

-- PASO 6: DIAGNÓSTICO - Ver tus profiles
SELECT
  '👤 Tus profiles:' as info,
  id as profile_id,
  name,
  user_id
FROM profiles
WHERE user_id = auth.uid();

-- PASO 7: TEST MANUAL (ejecuta después si quieres probar)
-- Reemplaza 'TU_PROFILE_ID' con uno de los IDs de arriba
/*
DO $$
DECLARE
  test_profile_id uuid;
BEGIN
  -- Obtener el primer profile del usuario
  SELECT id INTO test_profile_id
  FROM profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Intentar INSERT
  INSERT INTO category_instances (
    id,
    profile_id,
    name,
    category_type,
    period_type,
    start_date,
    end_date,
    schedule_days,
    schedule_start_time,
    schedule_end_time,
    times_per_week,
    color,
    icon,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_profile_id,
    'TEST SQL MANUAL',
    'materia',
    'semestral',
    '2026-01-01',
    '2026-06-30',
    ARRAY[1,3,5],
    '14:00',
    '16:00',
    3,
    '#FF0000',
    '🧪',
    true,
    now(),
    now()
  );

  RAISE NOTICE '✅ INSERT exitoso! La política funciona correctamente';
END $$;
*/
