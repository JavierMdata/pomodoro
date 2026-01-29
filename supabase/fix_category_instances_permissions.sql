-- ============================================
-- FIX: Arreglar permisos de category_instances
-- ============================================

-- Habilitar RLS (es mejor práctica que deshabilitarlo)
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can create their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

-- Política SELECT: Los usuarios pueden ver sus propias instancias
CREATE POLICY "Users can view their own category instances"
  ON category_instances
  FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Política INSERT: Los usuarios pueden crear instancias para sus perfiles
CREATE POLICY "Users can create their own category instances"
  ON category_instances
  FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Política UPDATE: Los usuarios pueden actualizar sus propias instancias
CREATE POLICY "Users can update their own category instances"
  ON category_instances
  FOR UPDATE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ))
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Política DELETE: Los usuarios pueden eliminar sus propias instancias
CREATE POLICY "Users can delete their own category instances"
  ON category_instances
  FOR DELETE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Otorgar permisos explícitos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON category_instances TO authenticated;
GRANT USAGE ON SEQUENCE category_instances_id_seq TO authenticated;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
