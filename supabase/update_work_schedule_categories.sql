-- ============================================
-- MIGRACIÓN: AGREGAR CATEGORÍAS Y MATERIAS AL HORARIO
-- ============================================

-- Agregar nuevas columnas a la tabla work_schedule existente
ALTER TABLE work_schedule
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_work_schedule_subject ON work_schedule(subject_id);
CREATE INDEX IF NOT EXISTS idx_work_schedule_category ON work_schedule(category);

-- Agregar comentarios descriptivos
COMMENT ON COLUMN work_schedule.category IS 'Categoría: materia, idioma, trabajo, gym, proyecto, otro';
COMMENT ON COLUMN work_schedule.subject_id IS 'Si es materia, referencia a subjects (opcional)';

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================
