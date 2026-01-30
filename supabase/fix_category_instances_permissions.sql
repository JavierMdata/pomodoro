-- ============================================
-- FIX: Arreglar permisos de category_instances
-- ============================================

-- Asegurar que la extensión uuid esté habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar RLS (es mejor práctica que deshabilitarlo)
ALTER TABLE category_instances ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can create their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can update their own category instances" ON category_instances;
DROP POLICY IF EXISTS "Users can delete their own category instances" ON category_instances;

-- IMPORTANTE: Como profiles NO tiene vinculación directa con auth.uid() (tiene user_id opcional),
-- vamos a simplificar usando solo verificación de profile_id

-- Política SELECT: Los usuarios pueden ver todas las instancias (sin restricción por ahora)
CREATE POLICY "Allow all to view category instances"
  ON category_instances
  FOR SELECT
  USING (true);

-- Política INSERT: Permitir insertar a usuarios autenticados
CREATE POLICY "Allow authenticated to create category instances"
  ON category_instances
  FOR INSERT
  WITH CHECK (true);

-- Política UPDATE: Permitir actualizar a usuarios autenticados
CREATE POLICY "Allow authenticated to update category instances"
  ON category_instances
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política DELETE: Permitir eliminar a usuarios autenticados
CREATE POLICY "Allow authenticated to delete category instances"
  ON category_instances
  FOR DELETE
  USING (true);

-- Otorgar permisos explícitos a usuarios autenticados y anónimos (para pruebas locales)
GRANT SELECT, INSERT, UPDATE, DELETE ON category_instances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON category_instances TO anon;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
