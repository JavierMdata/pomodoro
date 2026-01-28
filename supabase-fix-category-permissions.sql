-- =====================================================
-- FIX: Permisos RLS para category_instances
-- =====================================================
-- Este script arregla el error: "permission denied for table category_instances"

-- Habilitar RLS en la tabla category_instances
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can insert their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

-- Política para SELECT (ver)
-- NOTA: category_instances NO tiene campo user_id, solo profile_id
CREATE POLICY "Users can view their own category instances"
ON category_instances
FOR SELECT
USING (profile_id::text IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()::text
));

-- Política para INSERT (crear)
CREATE POLICY "Users can insert their own category instances"
ON category_instances
FOR INSERT
WITH CHECK (profile_id::text IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()::text
));

-- Política para UPDATE (actualizar)
CREATE POLICY "Users can update their own category instances"
ON category_instances
FOR UPDATE
USING (profile_id::text IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()::text
))
WITH CHECK (profile_id::text IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()::text
));

-- Política para DELETE (eliminar)
CREATE POLICY "Users can delete their own category instances"
ON category_instances
FOR DELETE
USING (profile_id::text IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()::text
));

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'category_instances';

-- Resultado esperado:
-- Deberías ver 4 políticas:
-- 1. Users can view their own category instances (SELECT)
-- 2. Users can insert their own category instances (INSERT)
-- 3. Users can update their own category instances (UPDATE)
-- 4. Users can delete their own category instances (DELETE)
