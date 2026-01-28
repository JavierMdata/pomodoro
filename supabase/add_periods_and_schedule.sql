-- ============================================
-- MIGRACIÓN: PERIODOS DINÁMICOS Y HORARIO DE TRABAJO
-- ============================================

-- 1. MEJORAR TABLA DE PERIODOS ESCOLARES
ALTER TABLE school_periods
  ADD COLUMN IF NOT EXISTS period_type VARCHAR(50) DEFAULT 'semestre',
  ADD COLUMN IF NOT EXISTS total_weeks INTEGER,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Índice para búsquedas rápidas por tipo
CREATE INDEX IF NOT EXISTS idx_school_periods_type ON school_periods(period_type);
CREATE INDEX IF NOT EXISTS idx_school_periods_active ON school_periods(is_active);

COMMENT ON COLUMN school_periods.period_type IS 'Tipo de periodo: trimestre, semestre, año, custom';
COMMENT ON COLUMN school_periods.total_weeks IS 'Número total de semanas del periodo';
COMMENT ON COLUMN school_periods.description IS 'Descripción opcional del periodo';

-- 2. CREAR TABLA DE HORARIO DE TRABAJO (Work Schedule)
-- Representa los bloques de tiempo que el usuario dedica a estudiar/trabajar
CREATE TABLE IF NOT EXISTS work_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type VARCHAR(50) DEFAULT 'study', -- 'study', 'work', 'break', 'other'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_work_schedule_profile ON work_schedule(profile_id);
CREATE INDEX IF NOT EXISTS idx_work_schedule_day ON work_schedule(day_of_week);
CREATE INDEX IF NOT EXISTS idx_work_schedule_active ON work_schedule(is_active);

COMMENT ON TABLE work_schedule IS 'Bloques de tiempo de trabajo/estudio del usuario (motor de la app)';
COMMENT ON COLUMN work_schedule.day_of_week IS '0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado';
COMMENT ON COLUMN work_schedule.block_type IS 'Tipo de bloque: study (estudio), work (trabajo), break (descanso), other (otro)';

-- 3. CREAR TABLA DE DISTRIBUCIÓN DE TIEMPO POR MATERIA
-- Almacena cómo se distribuyen las horas de trabajo entre las materias
CREATE TABLE IF NOT EXISTS subject_time_allocation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  allocated_hours_per_week DECIMAL(5,2) DEFAULT 0,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  auto_calculated BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_subject_allocation_profile ON subject_time_allocation(profile_id);
CREATE INDEX IF NOT EXISTS idx_subject_allocation_subject ON subject_time_allocation(subject_id);

COMMENT ON TABLE subject_time_allocation IS 'Distribución de horas de estudio por materia basada en el horario de trabajo';
COMMENT ON COLUMN subject_time_allocation.allocated_hours_per_week IS 'Horas asignadas por semana a esta materia';
COMMENT ON COLUMN subject_time_allocation.priority_level IS 'Prioridad de 1 (más baja) a 5 (más alta)';
COMMENT ON COLUMN subject_time_allocation.auto_calculated IS 'Si la distribución se calcula automáticamente o es manual';

-- 4. FUNCIÓN PARA CALCULAR SEMANA ACTUAL DE UN PERIODO
CREATE OR REPLACE FUNCTION get_current_week_of_period(period_id UUID)
RETURNS TABLE(
  current_week INTEGER,
  total_weeks INTEGER,
  weeks_remaining INTEGER,
  progress_percentage DECIMAL(5,2)
) AS $$
DECLARE
  p_start_date DATE;
  p_end_date DATE;
  p_total_weeks INTEGER;
  days_since_start INTEGER;
  calc_current_week INTEGER;
BEGIN
  -- Obtener datos del periodo
  SELECT start_date, end_date
  INTO p_start_date, p_end_date
  FROM school_periods
  WHERE id = period_id;

  -- Calcular total de semanas
  p_total_weeks := CEIL(EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / (7 * 24 * 60 * 60));

  -- Calcular semana actual
  days_since_start := CURRENT_DATE - p_start_date;
  calc_current_week := LEAST(CEIL(days_since_start::DECIMAL / 7), p_total_weeks);
  calc_current_week := GREATEST(calc_current_week, 1); -- Mínimo semana 1

  RETURN QUERY SELECT
    calc_current_week,
    p_total_weeks,
    p_total_weeks - calc_current_week,
    ROUND((calc_current_week::DECIMAL / p_total_weeks * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCIÓN PARA CALCULAR HORAS TOTALES DE TRABAJO POR SEMANA
CREATE OR REPLACE FUNCTION calculate_weekly_work_hours(p_profile_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_hours DECIMAL(5,2);
BEGIN
  SELECT COALESCE(SUM(
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
  ), 0)
  INTO total_hours
  FROM work_schedule
  WHERE profile_id = p_profile_id
    AND is_active = true;

  RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- 6. ACTUALIZAR total_weeks EN PERIODOS EXISTENTES
UPDATE school_periods
SET total_weeks = CEIL(EXTRACT(EPOCH FROM (end_date - start_date)) / (7 * 24 * 60 * 60))
WHERE total_weeks IS NULL;

-- Desactivar RLS para las nuevas tablas (modo público para pruebas)
ALTER TABLE work_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE subject_time_allocation DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
