-- =====================================================
-- SCRIPT FINAL QUE SÍ FUNCIONA - NO MÁS ERRORES
-- =====================================================
-- Copia TODO este archivo y pégalo en Supabase SQL Editor

-- PASO 1: Limpiar completamente
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;
DROP POLICY IF EXISTS "category_instances_select_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_insert_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_update_policy" ON category_instances;
DROP POLICY IF EXISTS "category_instances_delete_policy" ON category_instances;

-- PASO 2: Habilitar RLS nuevamente
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- PASO 3: Políticas SIMPLIFICADAS que SÍ funcionan

-- SELECT: Ver categorías
CREATE POLICY "select_own_categories"
ON category_instances
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- INSERT: La clave es NO usar category_instances.profile_id
CREATE POLICY "insert_own_categories"
ON category_instances
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- UPDATE: Actualizar categorías
CREATE POLICY "update_own_categories"
ON category_instances
FOR UPDATE
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

-- DELETE: Eliminar categorías
CREATE POLICY "delete_own_categories"
ON category_instances
FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- PASO 4: Verificar
SELECT
  'Políticas creadas:' as mensaje,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'category_instances'
ORDER BY cmd;

-- DEBERÍAS VER 4 POLÍTICAS:
-- delete_own_categories (DELETE)
-- insert_own_categories (INSERT)
-- select_own_categories (SELECT)
-- update_own_categories (UPDATE)

-- =====================================================
-- TEST MANUAL (Opcional - ejecuta después)
-- =====================================================
-- Si quieres probar manualmente, primero obtén tu profile_id:
SELECT
  'Mis profiles:' as info,
  id as profile_id,
  name
FROM profiles
WHERE user_id = auth.uid();

-- Luego puedes hacer un INSERT de prueba reemplazando 'TU_PROFILE_ID':
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
  'TU_PROFILE_ID_AQUI',  -- <-- REEMPLAZA ESTO
  'Test Manual',
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

-- Si ese INSERT manual funciona, entonces las políticas están bien
-- y el problema sería en el código de la aplicación
