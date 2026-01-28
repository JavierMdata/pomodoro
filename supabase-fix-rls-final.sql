-- =====================================================
-- FIX FINAL: Políticas RLS correctas para category_instances
-- =====================================================
-- El problema era que en INSERT, la referencia a category_instances.profile_id no funciona

-- Habilitar RLS
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

-- =====================================================
-- POLÍTICA SELECT: Ver solo instancias del usuario
-- =====================================================
CREATE POLICY "Users can view their own category instances"
ON category_instances
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = category_instances.profile_id
      AND p.user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- POLÍTICA INSERT: Crear solo si el profile es del usuario
-- NOTA: Durante INSERT, se usa la columna directamente sin prefijo de tabla
-- =====================================================
CREATE POLICY "Users can insert their own category instances"
ON category_instances
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT p.id
    FROM profiles p
    WHERE p.user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- POLÍTICA UPDATE: Actualizar solo instancias del usuario
-- =====================================================
CREATE POLICY "Users can update their own category instances"
ON category_instances
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = category_instances.profile_id
      AND p.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  profile_id IN (
    SELECT p.id
    FROM profiles p
    WHERE p.user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- POLÍTICA DELETE: Eliminar solo instancias del usuario
-- =====================================================
CREATE POLICY "Users can delete their own category instances"
ON category_instances
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = category_instances.profile_id
      AND p.user_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'category_instances'
ORDER BY cmd;

-- =====================================================
-- PRUEBA DE DIAGNÓSTICO (ejecuta esto después)
-- =====================================================
-- Ver el user_id actual del usuario autenticado:
SELECT
  auth.uid() as "Mi auth.uid()",
  (SELECT user_id FROM profiles WHERE user_id = auth.uid()) as "Mi user_id en profiles";

-- Ver los profiles que tengo acceso:
SELECT id, name, user_id
FROM profiles
WHERE user_id = (SELECT auth.uid());
