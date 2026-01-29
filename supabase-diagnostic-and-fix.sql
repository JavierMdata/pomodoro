-- =====================================================
-- DIAGNÓSTICO Y FIX DEFINITIVO - category_instances
-- =====================================================

-- PASO 1: Ver el usuario actual y sus profiles
SELECT
  'Mi user_id actual' as descripcion,
  auth.uid() as user_id;

SELECT
  'Mis profiles' as descripcion,
  id as profile_id,
  name,
  user_id
FROM profiles
WHERE user_id = auth.uid();

-- PASO 2: Eliminar TODAS las políticas anteriores
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

-- PASO 3: Habilitar RLS nuevamente
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas SIMPLES que SÍ funcionan
-- Estas políticas usan la sintaxis MÁS SIMPLE posible

-- SELECT: Ver solo mis categorías
CREATE POLICY "category_instances_select_policy"
ON category_instances
FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- INSERT: Crear solo en mis profiles
CREATE POLICY "category_instances_insert_policy"
ON category_instances
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- UPDATE: Actualizar solo mis categorías
CREATE POLICY "category_instances_update_policy"
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

-- DELETE: Eliminar solo mis categorías
CREATE POLICY "category_instances_delete_policy"
ON category_instances
FOR DELETE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- PASO 5: Verificar que se crearon
SELECT
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies
WHERE tablename = 'category_instances'
ORDER BY cmd;

-- PASO 6: Test manual de INSERT (EJECUTA ESTO DESPUÉS)
-- Reemplaza 'TU_PROFILE_ID' con uno de tus profile_id de arriba
/*
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
  'TU_PROFILE_ID',  -- REEMPLAZA CON TU PROFILE ID
  'Test Materia',
  'materia',
  'semestral',
  '2026-01-01',
  '2026-06-30',
  ARRAY[1,3,5],
  '14:00',
  '16:00',
  3,
  '#6366F1',
  '📚',
  true,
  now(),
  now()
);
*/

-- Si el INSERT manual funciona, el problema está resuelto
-- Si falla, ejecuta esto para ver el error exacto:
-- \set VERBOSITY verbose
