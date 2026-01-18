-- ============================================
-- SCRIPT PARA AÑADIR HORARIOS A TUS MATERIAS
-- ============================================
-- Ejecuta este script en Supabase SQL Editor
-- para crear horarios automáticamente para todas tus materias existentes

-- IMPORTANTE: Este script NO borra datos existentes,
-- solo añade horarios si no existen ya

-- ============================================
-- PASO 1: Ver cuántas materias tienes
-- ============================================
-- Ejecuta esto primero para ver tus materias:
-- SELECT id, name, profile_id FROM subjects ORDER BY name;

-- ============================================
-- PASO 2: AÑADIR HORARIOS AUTOMÁTICAMENTE
-- ============================================
-- Este script crea horarios de lunes a viernes para cada materia
-- distribuyéndolos en diferentes horas del día

-- Limpiar horarios duplicados (opcional, solo si quieres empezar de cero)
-- DELETE FROM class_schedule WHERE subject_id IN (SELECT id FROM subjects);

-- Crear horarios para cada materia existente
-- Distribuye las materias en diferentes días y horas

DO $$
DECLARE
  subject_record RECORD;
  subject_count INT := 0;
  day_of_week INT;
  start_hour INT;
  end_hour INT;
BEGIN
  -- Iterar sobre todas las materias
  FOR subject_record IN
    SELECT id, name FROM subjects ORDER BY created_at
  LOOP
    subject_count := subject_count + 1;

    -- Asignar día según el número de materia (circular)
    day_of_week := ((subject_count - 1) % 5) + 1; -- Lunes(1) a Viernes(5)

    -- Asignar horas según el número de materia
    CASE ((subject_count - 1) % 4)
      WHEN 0 THEN
        start_hour := 8;
        end_hour := 10;
      WHEN 1 THEN
        start_hour := 10;
        end_hour := 12;
      WHEN 2 THEN
        start_hour := 14;
        end_hour := 16;
      WHEN 3 THEN
        start_hour := 16;
        end_hour := 18;
    END CASE;

    -- Insertar 2 sesiones por semana para cada materia
    -- Sesión 1 (día principal)
    INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
    VALUES (
      subject_record.id,
      day_of_week,
      (start_hour || ':00:00')::TIME,
      (end_hour || ':00:00')::TIME
    )
    ON CONFLICT DO NOTHING;

    -- Sesión 2 (2 días después, si es lunes-miércoles, si no, día anterior)
    INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
    VALUES (
      subject_record.id,
      CASE
        WHEN day_of_week <= 3 THEN day_of_week + 2  -- Lunes→Miércoles, Martes→Jueves, Miércoles→Viernes
        ELSE day_of_week - 2  -- Jueves→Martes, Viernes→Miércoles
      END,
      (start_hour || ':00:00')::TIME,
      (end_hour || ':00:00')::TIME
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Horarios creados para: % (Días: % y %)',
      subject_record.name,
      day_of_week,
      CASE WHEN day_of_week <= 3 THEN day_of_week + 2 ELSE day_of_week - 2 END;
  END LOOP;

  RAISE NOTICE 'Total materias procesadas: %', subject_count;
END $$;

-- ============================================
-- PASO 3: VERIFICAR LOS HORARIOS CREADOS
-- ============================================
-- Ejecuta esto para ver todos los horarios creados:

SELECT
  s.name as materia,
  CASE cs.day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as dia,
  cs.start_time as inicio,
  cs.end_time as fin,
  s.professor_name as profesor,
  s.classroom as salon
FROM class_schedule cs
JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.day_of_week, cs.start_time;

-- ============================================
-- OPCIÓN ALTERNATIVA: AÑADIR HORARIOS MANUALMENTE
-- ============================================
-- Si prefieres añadir horarios específicos manualmente:
--
-- 1. Primero, obtén el ID de tu materia:
-- SELECT id, name FROM subjects WHERE name = 'TU_MATERIA_AQUI';
--
-- 2. Luego, inserta el horario:
-- INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
-- VALUES (
--   'ID_DE_TU_MATERIA_AQUI',  -- El UUID de tu materia
--   1,                          -- 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 0=Domingo
--   '08:00:00',                 -- Hora de inicio
--   '10:00:00'                  -- Hora de fin
-- );

-- Ejemplo concreto:
-- INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
-- VALUES (
--   '2b97a1fb-4683-4d30-a337-3554a1226706',  -- Crítica Económica (ejemplo de tu BD)
--   1,                                        -- Lunes
--   '08:00:00',
--   '10:00:00'
-- );
