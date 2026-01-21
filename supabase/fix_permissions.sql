-- ================================================================
-- SCRIPT DE CORRECCIÓN RÁPIDA: Arreglar Permisos
-- ================================================================
-- Ejecuta este script en Supabase SQL Editor para corregir
-- el error: "permission denied for materialized view knowledge_nodes"

-- 1. Dar permisos públicos a la función refresh_knowledge_graph
GRANT EXECUTE ON FUNCTION refresh_knowledge_graph() TO anon, authenticated;

-- 2. Dar permisos de lectura a la vista materializada knowledge_nodes
GRANT SELECT ON knowledge_nodes TO anon, authenticated;

-- 3. Confirmar que RLS está deshabilitado en las nuevas tablas
ALTER TABLE content_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE focus_journals DISABLE ROW LEVEL SECURITY;

-- 4. Refrescar la vista materializada por primera vez
SELECT refresh_knowledge_graph();

-- Mensaje de éxito
SELECT 'Permisos corregidos exitosamente' as status;
