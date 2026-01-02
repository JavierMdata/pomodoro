-- 1. Desactivar RLS temporalmente para permitir el flujo de datos sin autenticación
-- Ejecuta esto en el SQL Editor de Supabase para que la app pueda leer/escribir
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- 2. Si prefieres mantener RLS activado pero permitir acceso público (más seguro que desactivarlo)
-- Puedes usar estas políticas en su lugar (comenta las de arriba si usas estas):
/*
CREATE POLICY "Permitir acceso público a perfiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Permitir acceso público a periodos" ON school_periods FOR ALL USING (true);
CREATE POLICY "Permitir acceso público a materias" ON subjects FOR ALL USING (true);
CREATE POLICY "Permitir acceso público a tareas" ON tasks FOR ALL USING (true);
CREATE POLICY "Permitir acceso público a horarios" ON class_schedule FOR ALL USING (true);
*/

-- 3. Insertar un perfil inicial para que la app no aparezca vacía
INSERT INTO profiles (id, name, type, user_name, gender, is_active, color, icon)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'Mi Perfil', 
  'universidad', 
  'Usuario', 
  'otro', 
  true, 
  '#4F46E5', 
  'user'
) ON CONFLICT (id) DO NOTHING;
