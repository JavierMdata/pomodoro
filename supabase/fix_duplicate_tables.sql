-- ============================================
-- SCRIPT PARA ARREGLAR TABLA DUPLICADA
-- ============================================
-- Este script consolida class_schedule y class_schedules
-- y elimina la tabla duplicada

-- PASO 1: Verificar datos en ambas tablas
SELECT 'class_schedule' as tabla, COUNT(*) as registros FROM class_schedule
UNION ALL
SELECT 'class_schedules' as tabla, COUNT(*) as registros FROM class_schedules;

-- PASO 2: Copiar datos de class_schedules a class_schedule (si existen)
INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time, created_at)
SELECT subject_id, day_of_week, start_time, end_time, created_at
FROM class_schedules
WHERE NOT EXISTS (
  SELECT 1 FROM class_schedule cs
  WHERE cs.subject_id = class_schedules.subject_id
  AND cs.day_of_week = class_schedules.day_of_week
  AND cs.start_time = class_schedules.start_time
);

-- PASO 3: Eliminar políticas RLS de class_schedules
DROP POLICY IF EXISTS "allow_all_select" ON public.class_schedules;
DROP POLICY IF EXISTS "allow_all_insert" ON public.class_schedules;
DROP POLICY IF EXISTS "allow_all_update" ON public.class_schedules;
DROP POLICY IF EXISTS "allow_all_delete" ON public.class_schedules;

-- PASO 4: Eliminar la tabla duplicada
DROP TABLE IF EXISTS class_schedules CASCADE;

-- PASO 5: Verificar que class_schedule tiene los datos
SELECT
  s.name as materia,
  CASE cs.day_of_week
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
  END as dia,
  cs.start_time as inicio,
  cs.end_time as fin
FROM class_schedule cs
JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.day_of_week, cs.start_time;
